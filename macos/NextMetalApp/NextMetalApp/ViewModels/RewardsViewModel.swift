//
//  RewardsViewModel.swift
//  NextMetal
//
import SwiftUI

@MainActor
final class RewardsViewModel: ObservableObject {
    @Published private(set) var user: AppUser?
    @Published var errorMessage: String?

    func refresh() async {
        do {
            user = try await AuthAPI.profile()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}


