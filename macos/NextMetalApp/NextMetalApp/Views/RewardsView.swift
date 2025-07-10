//
//  RewardsView.swift
//  NextMetalApp
//
import SwiftUI

private struct NeonCircle<Content: View>: View {
    let content: Content
    init(@ViewBuilder _ content: () -> Content) { self.content = content() }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.cyberCyan, lineWidth: 4)
                .blur(radius: 6)
                .opacity(0.7)
                .scaleEffect(1.05)
                .animation(.easeInOut(duration: 1).repeatForever(), value: UUID())

            Circle()
                .fill(Color.cyberCyan.opacity(0.08))
                .overlay(content)
        }
        .frame(width: 160, height: 160)
    }
}

struct RewardsView: View {
    @StateObject private var vm = RewardsViewModel()
    private let timer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            header

            if let user = vm.user {
                HStack(spacing: 32) {
                    NeonCircle {
                        Text("\(user.pointsScore)")
                            .font(Orbitron.mono(size: 48, weight: .bold))
                            .foregroundColor(.cyberCyan)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text(user.nickname)
                            .font(Orbitron.mono(size: 20, weight: .semibold))
                            .foregroundColor(.white)
                        Text(user.email)
                            .font(.system(size: 14, design: .monospaced))
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            } else if let err = vm.errorMessage {
                Text(err).foregroundColor(.cyberRed)
            } else {
                ProgressView()
                    .progressViewStyle(.circular)
            }
        }
        .padding(32)
        .foregroundStyle(.white.opacity(0.9))
        .task { await vm.refresh() }             // initial load
        .onReceive(timer) { _ in Task { await vm.refresh() } }
    }

    private var header: some View {
        HStack {
            Text("NEXTMETAL.NODE")
                .font(Orbitron.mono(size: 16, weight: .semibold))
                .foregroundColor(.cyberYellow)
                .neon()

            Spacer()

            Button("↻ REFRESH") { Task { await vm.refresh() } }
                .buttonStyle(.borderedProminent)
        }
    }
}

