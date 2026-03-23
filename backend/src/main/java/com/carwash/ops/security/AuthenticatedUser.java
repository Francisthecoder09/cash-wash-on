package com.carwash.ops.security;

import com.carwash.ops.domain.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

public class AuthenticatedUser implements UserDetails {
    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public Long getStaffId() { return staffId; }

    private final Long id;
    private final Long branchId;
    private final Long staffId;
    private final String username;
    private final String password;
    private final List<? extends GrantedAuthority> authorities;
    private final boolean active;

    public AuthenticatedUser(User user) {
        this.id = user.getId();
        this.branchId = user.getBranch().getId();
        this.staffId = user.getStaff().getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        this.active = user.isActive();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return active;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
