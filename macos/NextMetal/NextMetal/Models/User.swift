//
//  User.swift
//  NextMetal
//
import Foundation

// MARK: – DTO
struct User: Codable, Hashable {
    let id: UUID
    let email: String
    let points: Int
}
