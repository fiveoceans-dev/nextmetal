// MARK: - DockerModel.swift

import Foundation
import os.log

// MARK: Errors
enum DockerError: LocalizedError {
    case notInstalled
    case daemonDown          // socket missing / daemon not running
    case forbidden           // permission denied opening socket
    case commandFailed(String)

    var errorDescription: String? {
        switch self {
        case .notInstalled:  "Docker CLI not found"
        case .daemonDown:    "Docker daemon is not running (socket unavailable)"
        case .forbidden:     "Permission denied when accessing docker.sock"
        case .commandFailed(let out): out
        }
    }
}

// MARK: Value types
struct DockerImage: Identifiable, Hashable {
    let id = UUID()
    let repository: String
    let tag: String
    let size: String
}

struct DockerContainer: Identifiable, Hashable {
    let id: String
    let names: String
    let image: String
    let status: String
    let state: String
}

// MARK: DockerModel – thin CLI wrapper
struct DockerModel {

    // MARK: High‑level API
    static func version() async throws -> String {
        try await shell("docker --version").trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func images() async throws -> [DockerImage] {
        let fmt = "--format '{{.Repository}}\t{{.Tag}}\t{{.Size}}'"
        let raw = try await shell("docker images \(fmt)")
        return raw.split(separator: "\n").compactMap { ln in
            let p = ln.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
            guard p.count == 3 else { return nil }
            return DockerImage(repository: p[0], tag: p[1], size: p[2])
        }
    }

    static func containers() async throws -> [DockerContainer] {
        let fmt = "--format '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.State}}'"
        let raw = try await shell("docker ps -a \(fmt)")
        return raw.split(separator: "\n").compactMap { ln in
            let p = ln.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
            guard p.count == 5 else { return nil }
            return DockerContainer(id: p[0], names: p[1], image: p[2], status: p[3], state: p[4])
        }
    }

    static func pull(image: String, progress: ((Double)->Void)? = nil) async throws {
        // simple pull, no granular progress – call once at start/end
        progress?(0)
        _ = try await shell("docker pull \(image)")
        progress?(1)
    }

    static func run(image: String) async throws {
        // run detached container named <image>_app if not already running
        _ = try? await shell("docker run -d --name \(image)_app \(image)")
        try? await shell("docker start \(image)_app")
    }

    static func stopContainer(named name: String) async throws {
        _ = try? await shell("docker stop \(name)_app")
    }

    // MARK: – Shell plumbing
    private static func dockerPath() -> String? {
        let env = ProcessInfo.processInfo.environment["DOCKER_CLI_PATH"]
        let cand = [env,
                    "/opt/homebrew/bin/docker",
                    "/usr/local/bin/docker",
                    "/Applications/Docker.app/Contents/Resources/bin/docker"].compactMap { $0 }
        return cand.first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    @discardableResult
    private static func shell(_ raw: String) async throws -> String {
        let bin = dockerPath() ?? (try? whichDocker())
        guard let dockerBin = bin else { throw DockerError.notInstalled }
        // replace leading token
        var comps = raw.split(separator: " ").map(String.init)
        if comps.first == "docker" { comps[0] = dockerBin }
        let cmd = comps.joined(separator: " ")

        let p = Process()
        p.launchPath = "/bin/zsh"; p.arguments = ["-c", cmd]
        let pipe = Pipe(); p.standardOutput = pipe; p.standardError = pipe
        try p.run()

        return try await withCheckedThrowingContinuation { cont in
            p.terminationHandler = { _ in
                let out = String(decoding: pipe.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
                if p.terminationStatus == 0 { cont.resume(returning: out); return }
                if out.contains("permission denied") && out.contains("docker.sock") {
                    cont.resume(throwing: DockerError.forbidden); return }
                if out.contains("Is the docker daemon running") { cont.resume(throwing: DockerError.daemonDown); return }
                cont.resume(throwing: DockerError.commandFailed(out))
            }
        }
    }

    private static func whichDocker() throws -> String? {
        let p = Process(); p.launchPath = "/usr/bin/which"; p.arguments = ["docker"]
        let pipe = Pipe(); p.standardOutput = pipe; try p.run(); p.waitUntilExit()
        guard p.terminationStatus == 0 else { return nil }
        return String(decoding: pipe.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
