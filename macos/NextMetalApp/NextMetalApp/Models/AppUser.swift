//
//  AppUser.swift
//  NextMetalApp
//
import Foundation

struct AppUser: Decodable, Identifiable {
    let id: UUID
    let email: String
    let nickname: String
    let pointsScore: Int       // ← camel-cased

    enum CodingKeys: String, CodingKey {
        case id, email, nickname
        case pointsScore = "points_score"
    }
}
