//
//  DockerModel.swift
//  NextMetalApp
//
import Foundation

// MARK: – Errors ------------------------------------------------------------
enum DockerError: LocalizedError {
    case notInstalled
    case daemonDown
    case forbidden
    case commandFailed(String)

    var errorDescription: String? {
        switch self {
        case .notInstalled:  "Docker CLI not found"
        case .daemonDown:    "Docker daemon is not running"
        case .forbidden:     "Permission denied accessing docker.sock"
        case .commandFailed(let o): o
        }
    }
}


// MARK: – DTOs --------------------------------------------------------------
struct DockerImage: Identifiable, Hashable {
    let id = UUID()
    let repository, tag, size: String
}

struct DockerContainer: Identifiable, Hashable {
    let id, names, image, status, state: String
    var shortID: String { String(id.prefix(12)) }
}


// MARK: – Model -------------------------------------------------------------
enum DockerModel {

    // PUBLIC API ----------------------------------------------------------

    static func version() async throws -> String {
        try await shell("docker --version").trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func images() async throws -> [DockerImage] {
        let fmt = #"--format '{{.Repository}}\t{{.Tag}}\t{{.Size}}'"#
        let raw = try await shell("docker images \(fmt)")
        return raw.split(separator: "\n").compactMap {
            let p = $0.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
            guard p.count == 3 else { return nil }
            return DockerImage(repository: p[0], tag: p[1], size: p[2])
        }
    }

    static func containers() async throws -> [DockerContainer] {
        let fmt = #"--format '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.State}}'"#
        let raw = try await shell("docker ps -a \(fmt)")
        return raw.split(separator: "\n").compactMap {
            let p = $0.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
            guard p.count == 5 else { return nil }
            return DockerContainer(id: p[0], names: p[1], image: p[2],
                                   status: p[3], state: p[4])
        }
    }

    static func start(container id: String) async throws { _ = try await shell("docker start \(id)") }
    static func stop (container id: String) async throws { _ = try await shell("docker stop  \(id)") }

    // INTERNALS -----------------------------------------------------------

    /// Resolve docker binary (Homebrew / Desktop bundle / user override)
    private static func dockerPath() -> String? {
        let override = ProcessInfo.processInfo.environment["DOCKER_CLI_PATH"]
        let candidates = [
            override,
            "/opt/homebrew/bin/docker",
            "/usr/local/bin/docker",
            "/Applications/Docker.app/Contents/Resources/bin/docker"
        ].compactMap { $0 }
        return candidates.first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    /// Thin async shell launcher that maps common daemon / permission errors.
    @discardableResult
    private static func shell(_ rawCmd: String) async throws -> String {

        let dockerBin: String
        if let path = dockerPath() {
            dockerBin = path
        } else {
            dockerBin = try whichDocker()!
        }


        // Replace leading "docker" with absolute path
        let cmd: String = {
            var parts = rawCmd.split(separator: " ", omittingEmptySubsequences: true).map(String.init)
            if parts.first == "docker" { parts[0] = dockerBin }
            return parts.joined(separator: " ")
        }()

        do { return try await runAsync(cmd) }
        catch ShellError.nonZeroExit(let stderr) {
            if stderr.contains("permission denied") && stderr.contains("docker.sock") {
                throw DockerError.forbidden
            }
            if stderr.contains("Is the docker daemon running?") ||
               stderr.contains("no such file or directory")      {
                throw DockerError.daemonDown
            }
            throw DockerError.commandFailed(stderr)
        }
    }

    private static func whichDocker() throws -> String? {
        try? shRun("command -v docker")
    }
}
