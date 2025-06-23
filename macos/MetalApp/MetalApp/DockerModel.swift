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
        case .notInstalled:
            return "Docker CLI not found"
        case .daemonDown:
            return "Docker daemon is not running (socket unavailable)"
        case .forbidden:
            return "Permission denied when accessing docker.sock"
        case .commandFailed(let output):
            return output
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

// MARK: - DockerModel (CLI wrapper)
struct DockerModel {

    // MARK: Public API

    static func version() async throws -> String {
        try await shell("docker --version").trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func images() async throws -> [DockerImage] {
        let fmt = "--format '{{.Repository}}\\t{{.Tag}}\\t{{.Size}}'"
        let raw = try await shell("docker images \(fmt)")
        return raw.split(separator: "\n").compactMap { line in
            let p = line.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
            guard p.count == 3 else { return nil }
            return DockerImage(repository: p[0], tag: p[1], size: p[2])
        }
    }

    static func containers() async throws -> [DockerContainer] {
        let fmt = "--format '{{.ID}}\\t{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.State}}'"
        let raw = try await shell("docker ps -a \(fmt)")
        return raw.split(separator: "\n").compactMap { line in
            let p = line.split(separator: "\t", omittingEmptySubsequences: false).map(String.init)
            guard p.count == 5 else { return nil }
            return DockerContainer(id: p[0], names: p[1], image: p[2], status: p[3], state: p[4])
        }
    }

    static func start(container id: String) async throws { _ = try await shell("docker start \(id)") }
    static func stop(container id: String)  async throws { _ = try await shell("docker stop \(id)") }

    // MARK: Private helpers

    private static func dockerPath() -> String? {
        let env = ProcessInfo.processInfo.environment["DOCKER_CLI_PATH"]
        let candidates = [
            env,
            "/opt/homebrew/bin/docker",                              // Apple-Silicon Homebrew
            "/usr/local/bin/docker",                                 // Intel Homebrew / Desktop symlink
            "/Applications/Docker.app/Contents/Resources/bin/docker" // Docker Desktop bundle
        ].compactMap { $0 }
        return candidates.first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    @discardableResult
    private static func shell(_ rawCmd: String) async throws -> String {
        // Locate docker binary
        let bin = dockerPath() ?? (try? whichDocker())
        guard let dockerBin = bin else { throw DockerError.notInstalled }

        // Replace leading “docker” token with absolute path
        let cmd: String = {
            var parts = rawCmd.split(separator: " ", omittingEmptySubsequences: true).map(String.init)
            if parts.first == "docker" { parts[0] = dockerBin }
            return parts.joined(separator: " ")
        }()

        let proc = Process()
        proc.launchPath = "/bin/zsh"
        proc.arguments  = ["-c", cmd]

        let pipe = Pipe()
        proc.standardOutput = pipe
        proc.standardError  = pipe
        try proc.run()

        return try await withCheckedThrowingContinuation { cont in
            proc.terminationHandler = { _ in
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                pipe.fileHandleForReading.closeFile()
                let output = String(decoding: data, as: UTF8.self)

                guard proc.terminationStatus != 127 else {       // command not found
                    cont.resume(throwing: DockerError.notInstalled); return
                }

                if proc.terminationStatus == 0 {
                    cont.resume(returning: output)
                    return
                }

                // Map common daemon / permission errors
                if output.contains("permission denied") && output.contains("docker.sock") {
                    cont.resume(throwing: DockerError.forbidden)
                } else if output.contains("Is the docker daemon running?") ||
                          output.contains("no such file or directory") {
                    cont.resume(throwing: DockerError.daemonDown)
                } else {
                    cont.resume(throwing: DockerError.commandFailed(output))
                }
            }
        }
    }

    private static func whichDocker() throws -> String? {
        let proc = Process()
        proc.launchPath = "/usr/bin/which"
        proc.arguments  = ["docker"]

        let pipe = Pipe()
        proc.standardOutput = pipe
        try proc.run()
        proc.waitUntilExit()

        guard proc.terminationStatus == 0 else { return nil }
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        return String(decoding: data, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
