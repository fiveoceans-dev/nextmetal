//
//  SettingsView.swift
//  NextMetalApp
//

import SwiftUI

struct SettingsView: View {
    @ObservedObject private var settings = AppSettings.shared
    @State private var state: DockerState = .unknown

    enum DockerState { case online, offline, unknown }

    var body: some View {
        Form {
            VStack(alignment: .leading, spacing: 12) {

                // ── Title + status badge ──────────
                HStack {
                    Text("Docker Engine").font(.headline)
                    Spacer()
                    badge(for: state)
                }

                // ── Socket path input ─────────────
                HStack {
                    TextField("/var/run/docker.sock",          // placeholder only
                              text: $settings.dockerHost,
                              onCommit: commit)
                        .textFieldStyle(.roundedBorder)
                        .font(.system(.body, design: .monospaced))

                    Button {
                        settings.resetDockerHost(); commit()
                    } label: { Image(systemName: "arrow.counterclockwise") }
                      .buttonStyle(.plain)
                      .help("Restore default socket path")
                }

                Text("e.g. /var/run/docker.sock or ssh://user@host")
                    .font(.footnote.monospaced())
                    .foregroundStyle(.secondary)

                // ── Manual ping ───────────────────
                Button("Test Connection") { Task { await ping() } }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
            }
            .padding(.vertical, 4)
        }
        .padding()
        .onAppear { commit() }          // initial ping
    }

    // MARK: – Helpers
    private func commit() {
        settings.setDockerHost(settings.dockerHost)
        Task { await ping() }
    }

    private func ping() async {
        state = await DockerCLI.daemonIsAlive() ? .online : .offline
    }

    @ViewBuilder
    private func badge(for state: DockerState) -> some View {
        switch state {
        case .online:
            HStack(spacing: 4) {
                Circle().fill(Color.green).frame(width: 10, height: 10)
                Text("Online").font(.subheadline)
            }

        case .offline:
            HStack(spacing: 4) {
                Circle().fill(Color.red).frame(width: 10, height: 10)
                Text("Offline").font(.subheadline)
            }

        case .unknown:
            HStack(spacing: 4) {
                Circle().fill(Color.gray).frame(width: 10, height: 10)
                Text("…").font(.subheadline)
            }
        }
    }

}

#Preview { SettingsView() }
