//
//  AppSettings.swift
//  NextMetalApp
//

import Foundation

@MainActor
final class AppSettings: ObservableObject {

    static let shared = AppSettings()

    // User-editable socket / host string (empty = inherit from shell)
    @Published var dockerHost: String {
        didSet { UserDefaults.standard.set(dockerHost, forKey: "dockerHost") }
    }

    private init() {
        dockerHost = UserDefaults.standard.string(forKey: "dockerHost") ?? ""
    }

    func setDockerHost(_ raw: String) { dockerHost = raw }
    func resetDockerHost()           { dockerHost = "" }
}
