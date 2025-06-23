//
//  AppUser.swift
//  NextMetalApp
//
// Models/AppUser.swift
import Foundation

struct AppUser: Decodable {
    let id: UUID
    let email: String
    let points: Int
}
