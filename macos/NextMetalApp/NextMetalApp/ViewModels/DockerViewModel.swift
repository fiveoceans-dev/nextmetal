//
//  DockerVM.swift
//  NextMetalApp
//

import Foundation

@MainActor
final class DockerVM: ObservableObject {

    // ── Published state ────────────────────────────────────────────────
    @Published var containers : [DockerContainer] = []
    @Published var versionText: String = ""
    @Published var errorMessage: String?

    // ── Internals ───────────────────────────────────────────────────────
    private var ticker : Task<Void, Never>?

    /// Start the 5-second auto-refresh loop.
    func start() {
        guard ticker == nil else { return }
        ticker = Task { await loop() }
    }

    /// Stop the loop (call from `onDisappear`).
    func stop() {
        ticker?.cancel()
        ticker = nil
    }
    
    func manualRefresh() {
        Task { await refresh() }
    }

    /// One-shot CLI actions (pull / run / stop / rm)
    func pull  (image: String) { fire { try await DockerCLI.pull  (image) } }
    func run   (image: String) { fire { try await DockerCLI.run   (image) } }
    func stop  (id: String)    { fire { try await DockerCLI.stop  (id)    } }
    func remove(id: String)    { fire { try await DockerCLI.remove(id)    } }

    // MARK: – Loop & helpers ---------------------------------------------

    private func loop() async {
        while !Task.isCancelled {
            await refresh()
            try? await Task.sleep(for: .seconds(5))
        }
    }

    private func refresh() async {
        do {
            async let v  = DockerCLI.version()
            async let ls = DockerCLI.list()
            versionText  = try await v
            containers   = try await ls
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    /// Fire-and-forget wrapper used by pull / run / stop / rm.
    private func fire(_ block: @escaping () async throws -> Void) {
        Task {
            do   { try await block(); await refresh() }
            catch { errorMessage = error.localizedDescription }
        }
    }
}
