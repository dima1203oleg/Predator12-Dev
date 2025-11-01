from dagster import resource

@resource
def pg_resource(init_context):
    return None

@resource
def os_resource(init_context):
    return None
