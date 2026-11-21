package com.resugen.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    private Key getSigningKey() {
        byte[] keyBytes = java.util.HexFormat.of().parseHex(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);

            System.out.println("JWT validation successful");
            return true;

        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            System.err.println("JWT EXPIRED: " + ex.getMessage());

        } catch (io.jsonwebtoken.security.SignatureException ex) {
            System.err.println("JWT SIGNATURE INVALID: " + ex.getMessage());

        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            System.err.println("JWT MALFORMED: " + ex.getMessage());

        } catch (io.jsonwebtoken.UnsupportedJwtException ex) {
            System.err.println("JWT UNSUPPORTED: " + ex.getMessage());

        } catch (IllegalArgumentException ex) {
            System.err.println("JWT EMPTY OR INVALID: " + ex.getMessage());

        } catch (Exception ex) {
            System.err.println("JWT ERROR: " + ex.getClass().getName()
                    + " - " + ex.getMessage());
        }

        return false;
    }
}
