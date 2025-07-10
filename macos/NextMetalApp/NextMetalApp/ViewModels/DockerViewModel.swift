//
//  DockerViewModel.swift
//  NextMetalApp
//

import SwiftUI
import Foundation

// MARK: – Public image state shown in the grid
enum ImageState: Equatable {
    case remote
    case downloading(Double)
    case downloaded
    case running
}

extension ImageState {
    var tint: Color {
        switch self {
        case .running:      return .yellow
        case .downloaded:   return .blue
        case .downloading:  return .blue
        case .remote:       return .white
        }
    }

    var isDownloading: Bool {
        if case .downloading = self { return true }
        return false
    }
}



// MARK: – API payload
private struct ImageRow: Decodable {
    let name: String
    let description: String?
    let hub_url: String
    let status: Int
}

// MARK: – Model used by the grid
struct HubImage: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let description: String?
    let hubURL: String
    let status: Int

    /// Extracts `niip42/nextmetal-storage` from full hub_url
    var dockerSlug: String {
        hubURL.split(separator: "/").suffix(2).joined(separator: "/")
    }
}

@MainActor
final class DockerViewModel: ObservableObject {

    // Published for UI
    @Published var version: String             = "–"
    @Published var hubImages: [HubImage]       = []
    @Published var state: [String: ImageState] = [:]
    @Published var errorMessage: String?

    private let apiBase = URL(string: "https://nextmetal.org/api/core")!

    init() { Task { await initialLoad() } }

    // MARK: Boot
    private func initialLoad() async {
        await fetchCatalogue()
        await refreshAll()
    }

    // MARK: REST
    func fetchCatalogue() async {
        do {
            let url = apiBase.appendingPathComponent("images")
            let (data, _) = try await URLSession.shared.data(from: url)
            let rows = try JSONDecoder().decode([ImageRow].self, from: data)

            hubImages = rows.map {
                HubImage(name: $0.name, description: $0.description, hubURL: $0.hub_url, status: $0.status)
            }
        } catch {
            hubImages = ["storage","agents","database","functions","dApps", "hosting"].map {
                HubImage(name: $0, description: nil, hubURL: "https://hub.docker.com/_/\($0)", status: 1)
            }
            errorMessage = "Couldn’t reach catalogue – showing defaults."
        }

        // init state map
        for img in hubImages where state[img.name] == nil { state[img.name] = .remote }
    }

    // MARK: Docker polling
    func refreshAll() async {
        do {
            version = try await DockerModel.version()

            let imgs = try await DockerModel.images()
            for img in imgs            { state[img.repository] = .downloaded }

            let ctrs = try await DockerModel.containers()
            for c in ctrs where hubImages.map(\.dockerSlug).contains(c.image) {
                if let match = hubImages.first(where: { $0.dockerSlug == c.image }) {
                    state[match.name] = .running
                }
            }
        } catch { errorMessage = error.localizedDescription }
    }

    // MARK: UI helpers
    func statusLabel(for name: String) -> String {
        switch state[name] ?? .remote {
        case .remote:       "OFFLINE"
        case .downloading:  "DOWNLOADING"
        case .downloaded:   "READY"
        case .running:      "RUNNING"
        }
    }

    func progress(for name: String) -> Double {
        if case let .downloading(p) = state[name] { return p }
        return 0
    }

    // MARK: Actions
    func tapped(name: String) {
        guard let img = hubImages.first(where: { $0.name == name }) else { return }
        Task { await handle(img) }
    }

    private func handle(_ img: HubImage) async {
        let name   = img.name
        let docker = img.dockerSlug

        switch state[name] ?? .remote {
        case .remote:
            state[name] = .downloading(0)
            try? await DockerModel.pull(image: docker) { prog in
                Task { self.state[name] = .downloading(prog) }
            }
            state[name] = .downloaded

        case .downloaded:
            try? await DockerModel.run(image: docker)
            state[name] = .running

        case .running:
            try? await DockerModel.stopContainer(image: docker)
            state[name] = .downloaded

        case .downloading:
            break
        }
    }
}
