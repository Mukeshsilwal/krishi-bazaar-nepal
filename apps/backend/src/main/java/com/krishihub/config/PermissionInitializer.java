package com.krishihub.config;

import com.krishihub.auth.constant.PermissionConstants;
import com.krishihub.auth.entity.Permission;
import com.krishihub.auth.entity.Role;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.PermissionRepository;
import com.krishihub.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionInitializer implements ApplicationRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Initializing RBAC Permissions and Roles...");

        // 1. Define Standard Permissions
        List<String> standardPermissions = Arrays.asList(
            PermissionConstants.RBAC_ROLE_READ,
            PermissionConstants.RBAC_ROLE_WRITE,
            PermissionConstants.RBAC_ROLE_DELETE,
            PermissionConstants.RBAC_PERMISSION_READ,
            PermissionConstants.USER_MANAGEMENT_READ,
            PermissionConstants.USER_MANAGEMENT_WRITE,
            PermissionConstants.USER_MANAGEMENT_DELETE,
            PermissionConstants.USER_MANAGEMENT_VERIFY,
            PermissionConstants.CONTENT_ARTICLE_READ,
            PermissionConstants.CONTENT_ARTICLE_PUBLISH,
            PermissionConstants.CONTENT_ARTICLE_WRITE,
            PermissionConstants.NOTIFICATION_ALERT_MANAGE,
            PermissionConstants.NOTIFICATION_TEMPLATE_MANAGE,
            PermissionConstants.CMS_MANAGE,
            PermissionConstants.CONTENT_MANAGE,
            PermissionConstants.MARKETPLACE_PRODUCT_MANAGE,
            PermissionConstants.MASTER_DATA_MANAGE,
            PermissionConstants.ADMIN_PANEL,
            PermissionConstants.ADMIN_READ,
            PermissionConstants.ADMIN_WRITE,
            PermissionConstants.ADMIN_USERS,
            PermissionConstants.ADMIN_ROLES,
            PermissionConstants.ADMIN_SETTINGS,
            PermissionConstants.ADMIN_ANALYTICS,
            PermissionConstants.NOTIFICATION_MANAGE,
            PermissionConstants.LOGISTICS_MANAGE,
            PermissionConstants.LOGISTICS_READ,
            PermissionConstants.VEHICLE_READ,
            PermissionConstants.VEHICLE_CREATE,
            PermissionConstants.PAYMENT_READ,
            PermissionConstants.PAYMENT_INITIATE,
            PermissionConstants.PAYMENT_VERIFY,
            PermissionConstants.ORDER_READ,
            PermissionConstants.ORDER_CREATE,
            PermissionConstants.ORDER_UPDATE,
            PermissionConstants.ORDER_DELETE,
            PermissionConstants.MARKETPLACE_READ,
            PermissionConstants.MARKETPLACE_CREATE,
            PermissionConstants.MARKETPLACE_UPDATE,
            PermissionConstants.MARKETPLACE_DELETE,
            PermissionConstants.KNOWLEDGE_MANAGE,
            PermissionConstants.CALENDAR_MANAGE,
            PermissionConstants.FINANCE_MANAGE,
            PermissionConstants.AGRISTORE_MANAGE,
            PermissionConstants.DIAGNOSIS_CREATE,
            PermissionConstants.MASTERDATA_MANAGE,
            PermissionConstants.MASTER_DATA_READ,
            PermissionConstants.USER_READ,
            PermissionConstants.USER_VERIFY
        );

        Set<Permission> allPermissions = new HashSet<>();

        // 2. Create Permissions if they don't exist
        for (String permName : standardPermissions) {
            String module = permName.split(":")[0];
            Permission permission = permissionRepository.findByName(permName)
                    .orElseGet(() -> {
                        log.info("Creating missing permission: {}", permName);
                        return permissionRepository.save(Permission.builder()
                                .name(permName)
                                .module(module)
                                .description("System generated permission for " + permName)
                                .build());
                    });
            allPermissions.add(permission);
        }

        // 3. Ensure ADMIN and SUPER_ADMIN Roles Exist
        
        // Admin Role - Basic Management
        String adminRoleName = "ADMIN";
        roleRepository.findByName(adminRoleName).ifPresentOrElse(
            role -> {
                log.info("Updating ADMIN permissions...");
                role.getPermissions().addAll(allPermissions);
                roleRepository.save(role);
            },
            () -> {
                log.info("Creating ADMIN role...");
                Role role = Role.builder()
                        .name(adminRoleName)
                        .description("Administrator - Standard Access")
                        .isSystemDefined(true)
                        .permissions(allPermissions)
                        .build();
                roleRepository.save(role);
            }
        );

        // Super Admin Role - Full Access
        String superAdminRoleName = "SUPER_ADMIN";
        
        roleRepository.findByName(superAdminRoleName).ifPresentOrElse(
            role -> {
                log.info("Updating SUPER_ADMIN permissions...");
                // Add all new permissions to existing ones
                role.getPermissions().addAll(allPermissions);
                roleRepository.save(role);
            },
            () -> {
                log.info("Creating SUPER_ADMIN role...");
                Role role = Role.builder()
                        .name(superAdminRoleName)
                        .description("Super Administrator - Full Access")
                        .isSystemDefined(true)
                        .permissions(allPermissions)
                        .build();
                roleRepository.save(role);
            }
        );

        log.info("RBAC Initialization Completed.");
    }
}
