FROM prom/prometheus:v2.45.0

# Copy configuration from canonical observability directory
COPY observability/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
COPY observability/prometheus/rules/ /etc/prometheus/rules/

# Set ownership
USER root
RUN chown -R prometheus:prometheus /etc/prometheus
USER prometheus

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:9090/-/healthy || exit 1

EXPOSE 9090

CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--storage.tsdb.path=/prometheus", \
     "--web.console.libraries=/etc/prometheus/console_libraries", \
     "--web.console.templates=/etc/prometheus/consoles", \
     "--storage.tsdb.retention.time=15d", \
     "--web.enable-lifecycle", \
     "--web.enable-admin-api"]
