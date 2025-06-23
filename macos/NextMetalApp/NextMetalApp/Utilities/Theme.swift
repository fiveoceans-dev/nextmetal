//
//  Theme.swift
//  NextMetalApp
//
import SwiftUI

// ─────────────  Palette  ─────────────
extension Color {
    static let cyberBg      = Color(red: 3/255,   green: 15/255,  blue: 24/255)
    static let cyberGrid    = Color(red: 28/255,  green: 46/255,  blue: 61/255)
    static let cyberYellow  = Color(red: 246/255, green: 219/255, blue:  42/255)
    static let cyberCyan    = Color(red:  18/255, green: 156/255, blue: 252/255)
    static let cyberRed     = Color(red: 253/255, green:  79/255, blue:  79/255)
}

// ─────────────  Fonts  ─────────────
// • Add *Orbitron-Regular.ttf* (free Google font) to Assets → “Copy fonts”
enum Orbitron {
    static func mono(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("Orbitron", size: size).weight(weight)
    }
}

// ─────────────  Glow  ─────────────
struct NeonGlow: ViewModifier {
    var colour: Color
    func body(content: Content) -> some View {
        content
            .shadow(color: colour.opacity(0.9), radius: 6)
            .shadow(color: colour.opacity(0.6), radius: 12)
    }
}
extension View {
    func neon(_ c: Color = .cyberYellow) -> some View { self.modifier(NeonGlow(colour: c)) }
}

