//
//  AppSettings.swift
//  NextMetalApp
//

import Foundation

@MainActor
final class AppSettings: ObservableObject {
    static let shared = AppSettings()

    // ───────── Published prefs ─────────
    @Published var dockerHost: String {
        didSet { UserDefaults.standard.set(dockerHost, forKey: "dockerHost") }
    }

    private init() {
        // default → Docker Desktop user socket (inside sandbox scope)
        let defaultSock = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Group Containers/group.com.docker/docker.sock")
            .path
        let saved = UserDefaults.standard.string(forKey: "dockerHost")
        dockerHost = saved ?? "unix://\(defaultSock)"
    }

    /// Normalise & persist a user-supplied path or URL.
    func setDockerHost(_ raw: String) {
        var host = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if !host.contains("://") { host = "unix://\(host)" }
        if host.hasPrefix("unix:/") && !host.hasPrefix("unix:///") {
            host = host.replacingOccurrences(of: "unix:/", with: "unix:///")
        }
        dockerHost = host        // triggers didSet → UserDefaults
    }

    /// Restore default.
    func resetDockerHost() {
        UserDefaults.standard.removeObject(forKey: "dockerHost")
        self.dockerHost = UserDefaults.dockerHost   // will recompute default
    }
}

private extension UserDefaults {
    static var dockerHost: String {
        UserDefaults.standard.string(forKey: "dockerHost") ?? ""
    }
}
