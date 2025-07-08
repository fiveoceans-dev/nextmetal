//
//  DockerModel.swift
//  NextMetalApp
//

import Foundation
import os.log

// MARK: Errors
enum DockerError: LocalizedError {
    case notInstalled, daemonDown, forbidden
    case commandFailed(String)

    var errorDescription: String? {
        switch self {
        case .notInstalled:            "Docker CLI not found"
        case .daemonDown:              "Docker daemon is not running"
        case .forbidden:               "Permission denied when accessing docker.sock"
        case .commandFailed(let out):  out
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
    let id: String, names: String, image: String, status: String, state: String
}

// MARK: – Thin CLI wrapper
struct DockerModel {

    // MARK: Public API
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

    static func pull(image: String, progress: ((Double)->Void)?) async throws {
        progress?(0)
        _ = try await shell("docker pull \(image)")
        progress?(1)
    }

    /// Run container in detached mode; re-uses container if it already exists.
    static func run(image: String) async throws {
        let safe = makeSafeName(from: image)
        let exists = try? await shell("docker container inspect \(safe)_app --format '{{.Name}}'")
        if exists?.isEmpty ?? true {
            _ = try await shell("docker run -d --name \(safe)_app \(image)")
        } else {
            _ = try await shell("docker start \(safe)_app")
        }
    }

    static func stopContainer(image: String) async throws {
        let safe = makeSafeName(from: image)
        _ = try? await shell("docker stop \(safe)_app")
    }

    // MARK: Helpers
    private static func makeSafeName(from repo: String) -> String {
        repo.replacingOccurrences(of: "[:/]", with: "_", options: .regularExpression)
    }

    // MARK: Shell plumbing
    @discardableResult
    private static func shell(_ raw: String) async throws -> String {
        let bin = dockerPath() ?? (try? whichDocker())
        guard let dockerBin = bin else { throw DockerError.notInstalled }

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
                if p.terminationStatus == 0 { cont.resume(returning: out) ; return }
                if out.contains("permission denied") && out.contains("docker.sock") {
                    cont.resume(throwing: DockerError.forbidden) ; return
                }
                if out.contains("Is the docker daemon running") {
                    cont.resume(throwing: DockerError.daemonDown) ; return
                }
                cont.resume(throwing: DockerError.commandFailed(out))
            }
        }
    }

    private static func dockerPath() -> String? {
        let env = ProcessInfo.processInfo.environment["DOCKER_CLI_PATH"]
        let cand = [env,
                    "/opt/homebrew/bin/docker",
                    "/usr/local/bin/docker",
                    "/Applications/Docker.app/Contents/Resources/bin/docker"].compactMap { $0 }
        return cand.first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    private static func whichDocker() throws -> String? {
        let p = Process(); p.launchPath = "/usr/bin/which"; p.arguments = ["docker"]
        let pipe = Pipe(); p.standardOutput = pipe; try p.run(); p.waitUntilExit()
        guard p.terminationStatus == 0 else { return nil }
        return String(decoding: pipe.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
