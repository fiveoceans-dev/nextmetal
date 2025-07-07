//  DockerView.swift – stable compile
//  NextMetalApp
//
//  Clean rewrite: fixes string literals, ForEach initializer, misplaced `private`,
//  balanced braces, and preview macro.

import SwiftUI
import Combine

// MARK: - VM shim (replace when real polling ready)
extension DockerViewModel {
    @MainActor func refreshRunningStates() async { await refreshAll() }
}

// MARK: - Shape
private struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width, h = rect.height
        var p = Path()
        p.move(to: CGPoint(x: 0.25*w, y: 0))
        p.addLine(to: CGPoint(x: 0.75*w, y: 0))
        p.addLine(to: CGPoint(x: w,       y: 0.5*h))
        p.addLine(to: CGPoint(x: 0.75*w, y: h))
        p.addLine(to: CGPoint(x: 0.25*w, y: h))
        p.addLine(to: CGPoint(x: 0,      y: 0.5*h))
        p.closeSubpath()
        return p
    }
}

// MARK: - ImageState helpers
private extension ImageState {
    var tint: Color {
        switch self {
        case .remote, .downloading:   return .white
        case .downloaded:             return .cyberCyan
        case .running:                return .cyberYellow
        }
    }
    var isDownloading: Bool { if case .downloading = self { true } else { false } }
}

// MARK: - Hex button style
struct HexButtonStyle: ButtonStyle {
    let state: ImageState
    private var tint: Color { state.tint }

    func makeBody(configuration: Configuration) -> some View {
        let label = configuration.label
            .padding(.horizontal, 34)
            .padding(.vertical,   28)
            .font(Orbitron.mono(size: 14))
            .foregroundColor(tint)
            .frame(maxWidth: .infinity, maxHeight: .infinity)

        label
            .background(Hexagon().fill(tint.opacity(0.08)))
            .overlay(Hexagon().stroke(Color.white.opacity(0.7), lineWidth: 3))
            .scaleEffect(configuration.isPressed ? 0.94 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
            .background(progressRing)
            .overlay(runningPulse)
    }

    @ViewBuilder private var progressRing: some View {
        if case let .downloading(p) = state {
            GeometryReader { geo in
                Hexagon().path(in: geo.frame(in: .local))
                    .trim(from: 0, to: CGFloat(max(0.05, p)))
                    .stroke(Color.white, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 0.1), value: p)
            }
        }
    }

    @ViewBuilder private var runningPulse: some View {
        if case .running = state {
            GeometryReader { geo in
                Hexagon().path(in: geo.frame(in: .local))
                    .stroke(tint, lineWidth: 4)
                    .blur(radius: 6)
                    .opacity(0.6)
                    .scaleEffect(1.05)
                    .animation(.easeInOut(duration: 0.8).repeatForever(), value: UUID())
            }
        }
    }
}

// MARK: - Console view
private struct ConsoleView: View {
    let logs: String
    var body: some View {
        ScrollView {
            Text(logs.isEmpty ? "-- docker output --" : logs)
                .font(.system(size: 12, design: .monospaced))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
        }
        .background(Color.black.opacity(0.25))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.white.opacity(0.4), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Blink modifier
private struct Blink: ViewModifier {
    let active: Bool
    func body(content: Content) -> some View {
        content
            .opacity(active ? 0.2 : 1)
            .animation(active ? .easeInOut(duration: 0.6).repeatForever() : .default, value: active)
    }
}

// MARK: - Main view
struct DockerView: View {
    @StateObject private var vm = DockerViewModel()
    @State private var logs: String = ""

    private let timer = Timer.publish(every: 5, on: .main, in: .common).autoconnect()
    private let cols  = Array(repeating: GridItem(.fixed(160), spacing: 12), count: 3)

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            header
            HStack(alignment: .top, spacing: 32) {
                hexGrid
                ConsoleView(logs: logs)
                    .frame(width: 320)
                    .frame(minHeight: 400)
            }
        }
        .padding(32)
        .foregroundStyle(.white.opacity(0.9))
        .onReceive(timer) { _ in Task { await vm.refreshRunningStates() } }
    }

    // Header
    private var header: some View {
        HStack {
            Text("NEXTMETAL.NODE")
                .font(Orbitron.mono(size: 16, weight: .semibold))
                .foregroundColor(.cyberYellow)
                .neon()
            Text(vm.version)
                .font(Orbitron.mono(size: 12))
                .foregroundColor(.cyberCyan)
            Spacer()
            Button("↻ REFRESH") { Task { await vm.refreshAll() } }
                .buttonStyle(.borderedProminent)
        }
    }

    // Hex grid
    private var hexGrid: some View {
        LazyVGrid(columns: cols, spacing: 12) {
            ForEach(vm.hubImages.indices, id: \Int.self) { idx in
                let img = vm.hubImages[idx]
                Button {
                    Task {
                        vm.tapped(name: img.name)
                        logs.append("\n> tapped \(img.name)")
                    }
                } label: {
                    VStack(spacing: 4) {
                        Text(img.name.uppercased())
                        Text(statusLabel(for: img.name))
                            .font(.caption2)
                            .opacity(0.8)
                            .modifier(Blink(active: vm.state[img.name]?.isDownloading ?? false))
                    }
                }
                .buttonStyle(HexButtonStyle(state: vm.state[img.name] ?? .remote))
                .frame(height: 140)
            }
        }
    }

    private func statusLabel(for name: String) -> String {
        switch vm.state[name] ?? .remote {
        case .remote:       "DOWNLOAD"
        case .downloading:  "DOWNLOADING"
        case .downloaded:   "OFFLINE"
        case .running:      "ONLINE"
        }
    }
}

// MARK: - Preview
#Preview {
    DockerView()
        .preferredColorScheme(.dark)
        .frame(width: 1000, height: 640)
}
