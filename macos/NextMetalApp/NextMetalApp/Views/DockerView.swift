// DockerView.swift
//  NextMetalApp

import SwiftUI

struct DockerView: View {
    @StateObject private var vm = DockerViewModel()

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {

            // Header bar
            HStack(spacing: 12) {
                Text("DOCKER\\.NODE")
                    .font(Orbitron.mono(size: 14, weight: .semibold))
                    .foregroundColor(.cyberYellow)
                    .neon()

                Text(vm.version)
                    .font(Orbitron.mono(size: 11))
                    .foregroundColor(.cyberCyan)

                Spacer()

                Button("↻ REFRESH") { vm.refreshAll() }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
            }

            // Error banner
            if let err = vm.errorMessage {
                Text(err)
                    .font(Orbitron.mono(size: 11))
                    .foregroundColor(.cyberRed)
            }

            // Grid-panel
            Table(vm.containers) {
                TableColumn("ID",     value: \.shortID)
                TableColumn("IMAGE",  value: \.image)
                TableColumn("STATUS", value: \.status)
                TableColumn("STATE",  value: \.state)
                TableColumn("NAMES",  value: \.names)
            }
            .tableStyle(.inset(alternatesRowBackgrounds: true))
            .background(Color.cyberGrid.opacity(0.15))
            .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
        }
        .padding(20)
        .foregroundStyle(.white.opacity(0.9))
    }
}
