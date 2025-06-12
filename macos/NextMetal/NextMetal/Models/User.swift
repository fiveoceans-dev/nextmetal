//
//  User.swift
//  NextMetal
//
import Foundation
import Vapor

/// Single source-of-truth user model for client code, matching new schema.
struct AppUser: Content, Identifiable {
    let id: UUID
    let email: String
    var points: Int
    // var isVerified: Bool
    // var nickname: String?
    // var referredBy: String?
}
