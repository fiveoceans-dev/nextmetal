
// MARK: - DockerViewModel.swift

import SwiftUI
import Foundation

enum ImageState: Equatable {
    case remote
    case downloading(Double)   // 0…1
    case downloaded
    case running
}

struct HubImage: Identifiable, Hashable { let id = UUID(); let name: String }

@MainActor
final class DockerViewModel: ObservableObject {
    @Published var version: String = "–"
    @Published var hubImages: [HubImage] = []
    @Published var state: [String: ImageState] = [:]
    @Published var errorMessage: String?

    init() {
        Task { await initialLoad() }
    }

    func initialLoad() async {
        await fetchHub()
        await refreshAll()
    }

    func fetchHub() async {
        do {
            guard let url = URL(string: "https://hub.docker.com/v2/repositories/library/?page_size=5") else { return }
            let (data, _) = try await URLSession.shared.data(from: url)
            struct Resp: Decodable { struct Item: Decodable { let name: String } ; let results: [Item] }
            let decoded = try JSONDecoder().decode(Resp.self, from: data)
            hubImages = decoded.results.prefix(5).map { HubImage(name: $0.name) }
        } catch {
            hubImages = ["nginx","redis","mysql","alpine","python"].map(HubImage.init)
        }
        hubImages.forEach { if state[$0.name] == nil { state[$0.name] = .remote } }
    }

    func refreshAll() async {
        do {
            version = try await DockerModel.version()
            let imgs = try await DockerModel.images()
            let ctrs = try await DockerModel.containers()
            for img in imgs { state[img.repository] = .downloaded }
            for c in ctrs { if hubImages.map(\.name).contains(c.image) { state[c.image] = .running } }
        } catch { errorMessage = error.localizedDescription }
    }

    func tapped(name: String) {
        Task { await handle(name) }
    }

    private func handle(_ name: String) async {
        switch state[name] ?? .remote {
        case .remote:
            await MainActor.run { state[name] = .downloading(0) }
            try? await DockerModel.pull(image: name) { prog in
                // Ensure progress updates are published on the main actor
                Task { await MainActor.run { self.state[name] = .downloading(prog) } }
            }
            await MainActor.run { state[name] = .downloaded }

        case .downloaded:
            try? await DockerModel.run(image: name)
            await MainActor.run { state[name] = .running }

        case .running:
            try? await DockerModel.stopContainer(named: name)
            await MainActor.run { state[name] = .downloaded }

        case .downloading:
            break
        }
    }
}
