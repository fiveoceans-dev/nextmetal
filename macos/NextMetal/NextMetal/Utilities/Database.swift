//
//  Database.swift
//  NextMetal
//

// MARK: – Simple async Postgres helper
import NIOCore
import NIOPosix
import NIOSSL
import PostgresNIO

/// Extremely small convenience wrapper;
/// NOT a long-lived pool – created on every call.
/// Enough for an MVP desktop app.
enum DB {
    
    // MARK: – Public API
    static func query(
        _ sql: String,
        binds: [PostgresData] = []
    ) async throws -> [PostgresRow] {
        let group = MultiThreadedEventLoopGroup(numberOfThreads: 1)
        defer { try? await group.shutdownGracefully() }      // async-aware in Swift 6

        // Neon requires SSLMode = require
        let sslCtx = try NIOSSLContext(configuration: .makeClientConfiguration())
        
        let cfg = PostgresConnection.Configuration(
            host:     "ep-snowy-night-a49ez1ms-pooler.us-east-1.aws.neon.tech",
            port:     5432,
            username: "neondb_owner",
            password: "npg_37yxXoeNDClR",
            database: "neondb",
            tls:      .require(sslCtx)
        )
        
        let conn = try await PostgresConnection.connect(
            on: group.any(),
            configuration: cfg,
            id: .random(),
            logger: .init(label: "NextMetal.DB")
        )
        defer { try? await conn.close() }
        
        return try await conn.query(sql, binds)
    }
}

// Tiny extension – saves one level of nesting when binding strings
private extension Array where Element == PostgresData {
    static func str(_ value: String) -> [PostgresData] { [.init(string: value)] }
}
