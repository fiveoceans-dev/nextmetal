
// MARK: - File: DockerViewModel.swift

import Foundation
import SwiftUI

@MainActor
final class DockerViewModel: ObservableObject {
    @Published var version: String = "–"
    @Published var images: [DockerImage] = []
    @Published var containers: [DockerContainer] = []
    @Published var error: String?

    func refreshAll() async {
        do {
            version    = try await DockerModel.version()
            images      = try await DockerModel.images()
            containers  = try await DockerModel.containers()
            error       = nil
        } catch {
            self.error = error.localizedDescription
        }
    }

    func start(_ container: DockerContainer) async {
        do {
            try await DockerModel.start(container: container.id)
            try await Task.sleep(for: .milliseconds(300)) // give Docker a moment
            containers = try await DockerModel.containers()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func stop(_ container: DockerContainer) async {
        do {
            try await DockerModel.stop(container: container.id)
            try await Task.sleep(for: .milliseconds(300))
            containers = try await DockerModel.containers()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
