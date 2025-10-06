FROM grafana/grafana:10.2.2

# Set environment variables
ENV GF_SECURITY_ADMIN_PASSWORD=admin123 \
    GF_USERS_ALLOW_SIGN_UP=false \
    GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel

# Create directories
USER root
RUN mkdir -p /var/lib/grafana/dashboards /var/lib/grafana/provisioning/datasources /var/lib/grafana/provisioning/dashboards

# Copy provisioning configs
COPY grafana/provisioning/ /etc/grafana/provisioning/
COPY grafana/dashboards/ /var/lib/grafana/dashboards/

# Set ownership
RUN chown -R grafana:grafana /var/lib/grafana /etc/grafana/provisioning

# Switch back to grafana user
USER grafana

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000
