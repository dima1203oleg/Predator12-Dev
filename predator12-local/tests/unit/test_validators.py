import pandas as pd
from etl.validators.validators import validate_df

def test_validate_df():
    df = pd.DataFrame({
        "Номер митної декларації": ["123"],
        "ЄДРПОУ одержувача": ["12345678"],
        "Код товару": ["8707109010"]
    })
    validate_df(df)
