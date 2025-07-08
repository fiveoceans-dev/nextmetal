//
//  DockerView.swift – honeycomb grid + console (cleaned and structured)
//  NextMetalApp
//

import SwiftUI


// MARK: ──────────────── Shapes & Modifiers
private struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width, h = rect.height
        return Path {
            $0.move(to: CGPoint(x: 0.25*w, y: 0))
            $0.addLine(to: CGPoint(x: 0.75*w, y: 0))
            $0.addLine(to: CGPoint(x: w,      y: 0.5*h))
            $0.addLine(to: CGPoint(x: 0.75*w, y: h))
            $0.addLine(to: CGPoint(x: 0.25*w, y: h))
            $0.addLine(to: CGPoint(x: 0,      y: 0.5*h))
            $0.closeSubpath()
        }
    }
}

private struct Blink: ViewModifier {
    let active: Bool
    func body(content: Content) -> some View {
        content
            .opacity(active ? 0.2 : 1)
            .animation(active ? .easeInOut(duration: 0.6).repeatForever() : .default,
                       value: active)
    }
}

// MARK: ──────────────── UI Elements

private struct StatusDots: View {
    let tint: Color
    var body: some View {
        HStack(spacing: 4) {
            Circle().fill(tint == .white  ? .white  : .white.opacity(0.3))
            Circle().fill(tint == .blue   ? .blue   : .white.opacity(0.3))
            Circle().fill(tint == .yellow ? .yellow : .white.opacity(0.3))
        }
        .frame(width: 18, height: 6)
    }
}

private struct ConsoleView: View {
    let logs: String
    var body: some View {
        ScrollView {
            Text(logs.isEmpty ? "-- commands --" : logs)
                .font(.system(size: 12, design: .monospaced))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
        }
        .background(Color.black.opacity(0.25))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(.white.opacity(0.4), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

private struct HexButtonStyle: ButtonStyle {
    let state: ImageState

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 28)
            .padding(.vertical,   28)
            .font(Orbitron.mono(size: 14))
            .foregroundColor(state.tint)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Hexagon().fill(state.tint.opacity(0.08)))
            .overlay(Hexagon().stroke(.white.opacity(0.7), lineWidth: 3))
            .scaleEffect(configuration.isPressed ? 0.94 : 1)
            .overlay(pulseOverlay)        // ← unified pulse
    }

    @ViewBuilder private var pulseOverlay: some View {
        if state.isDownloading || state == .running {
            GeometryReader { geo in
                Hexagon().path(in: geo.frame(in: .local))
                    .stroke(state.tint, lineWidth: 4)
                    .blur(radius: 6)
                    .opacity(0.6)
                    .scaleEffect(1.05)
                    .animation(.easeInOut(duration: 0.8)
                                .repeatForever(), value: UUID())
            }
        }
    }
}


// MARK: ──────────────── Single Tile

private struct ImageTile: View {
    let img: HubImage
    let idx: Int
    @State private var pulse = false
    @ObservedObject var vm: DockerViewModel
    @Binding var logs: String

    private var xOff: CGFloat { idx % 3 == 0 ? 0 : 0 }
    private var yOff: CGFloat { idx % 3 == 1 ? 70 : 0 }

    var body: some View {
        Button {
            Task {
                vm.tapped(name: img.name)
                logs.append("$ \(img.name)\n")
            }
        } label: {
            VStack(spacing: 6) {
                let state = vm.state[img.name] ?? .remote

                StatusDots(tint: state.tint)
                Text(img.name.uppercased())

                // progress bar only during download
                if state.isDownloading {
                    Text("DOWNLOADING")
                        .font(.caption2)
                        .opacity(pulse ? 0.25 : 1)
                        .animation(.easeInOut(duration: 0.8).repeatForever(), value: pulse)
                        .onAppear { pulse.toggle() }
                } else {
                    Text(vm.statusLabel(for: img.name))
                        .font(.caption2)
                }
            }
            .padding(.top, 6)

        }
        .buttonStyle(HexButtonStyle(state: vm.state[img.name] ?? .remote))
        .frame(height: 140)
        .offset(x: xOff, y: yOff)
    }
}

// MARK: ──────────────── DockerView

struct DockerView: View {
    @StateObject private var vm = DockerViewModel()
    @State        private var logs = ""

    private let cols  = Array(repeating: GridItem(.fixed(160), spacing: 12), count: 3)
    private let timer = Timer.publish(every: 5, on: .main, in: .common).autoconnect()

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
        .onReceive(timer) { _ in Task { await vm.refreshAll() } }
    }

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

    private var hexGrid: some View {
        LazyVGrid(columns: cols, spacing: 50) {
            ForEach(Array(vm.hubImages.enumerated()), id: \.offset) { pair in
                ImageTile(img: pair.element, idx: pair.offset, vm: vm, logs: $logs)
            }
        }
    }
}
