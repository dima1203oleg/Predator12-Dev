import pandera as pa
from pandera import Column, DataFrameSchema

HS_CODE_REGEX = r"^\d{6,10}$"

DATE_MIN = "2010-01-01"
DATE_MAX = "2030-12-31"

def get_schema():
    return DataFrameSchema({
        "Номер митної декларації": Column(str, checks=pa.Check.str_length(min_value=3)),
        "ЄДРПОУ одержувача": Column(str, nullable=True, checks=pa.Check.str_length(8)),
        "Код товару": Column(str, nullable=True, checks=pa.Check.str_matches(HS_CODE_REGEX)),
        "Дата оформлення": Column(str, nullable=True),
        # ...інші поля та перевірки...
    })

def validate_df(df):
    schema = get_schema()
    try:
        out = schema.validate(df, lazy=True)
    except pa.errors.SchemaErrors:
        # Self-healing: заповнення пропусків і приведення типів
        df = df.copy()
        for col in ["Номер митної декларації", "ЄДРПОУ одержувача", "Код товару", "Дата оформлення"]:
            if col in df.columns:
                df[col] = df[col].astype(str).fillna("")
        out = schema.validate(df, lazy=True)
    # Додаткова нормалізація дат у дозволений діапазон
    if "Дата оформлення" in out.columns:
        import pandas as pd
        d = pd.to_datetime(out["Дата оформлення"], errors="coerce")
        d = d.clip(lower=pd.Timestamp(DATE_MIN), upper=pd.Timestamp(DATE_MAX))
        out["Дата оформлення"] = d.dt.strftime("%Y-%m-%d")
    return out
