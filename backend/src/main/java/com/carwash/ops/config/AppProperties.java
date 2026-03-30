package com.carwash.ops.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    public Jwt getJwt() { return jwt; }
    public void setJwt(Jwt jwt) { this.jwt = jwt; }
    public Cors getCors() { return cors; }
    public void setCors(Cors cors) { this.cors = cors; }

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();

    public static class Jwt {
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public long getExpirationMinutes() { return expirationMinutes; }
        public void setExpirationMinutes(long expirationMinutes) { this.expirationMinutes = expirationMinutes; }

        private String secret;
        private long expirationMinutes;
    }

    public static class Cors {
        public java.util.List<String> getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(java.util.List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
        public List<String> getAllowedOriginPatterns() { return allowedOriginPatterns; }
        public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) { this.allowedOriginPatterns = allowedOriginPatterns; }

        private java.util.List<String> allowedOrigins = java.util.List.of("http://localhost:5173");
        private java.util.List<String> allowedOriginPatterns = java.util.List.of("https://*.vercel.app");
    }
}
