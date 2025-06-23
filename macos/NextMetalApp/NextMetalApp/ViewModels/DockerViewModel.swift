//
//  DockerVM.swift
//  NextMetalApp
//
import Foundation
import SwiftUI

@MainActor
final class DockerViewModel: ObservableObject {

    @Published var version     = "–"
    @Published var images      = [DockerImage]()
    @Published var containers  = [DockerContainer]()
    @Published var errorMessage: String?
    
    func refreshAll() {
        Task {
            do {
                async let v  = DockerModel.version()
                async let im = DockerModel.images()
                async let ct = DockerModel.containers()
                version     = try await v
                images      = try await im
                containers  = try await ct
                errorMessage       = nil
            } catch {
                self.errorMessage  = error.localizedDescription
            }
        }
    }

    func start(_ c: DockerContainer) { mutate { try await DockerModel.start(container: c.id) } }
    func stop (_ c: DockerContainer) { mutate { try await DockerModel.stop (container: c.id) } }

    // Helper: run an async op then refresh the container list
    private func mutate(_ op: @escaping () async throws -> Void) {
        Task {
            do {
                try await op()
                try await Task.sleep(for: .milliseconds(300))
                self.containers = try await DockerModel.containers()
            } catch {
                self.errorMessage = error.localizedDescription
            }
        }
    }
}
