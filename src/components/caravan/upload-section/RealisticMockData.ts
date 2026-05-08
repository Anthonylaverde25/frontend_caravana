/**
 * Realistic mock data for Caravan OCR import testing.
 * Simulates a variety of cases: different sexes, breeds, weights, and categories.
 */
export const REALISTIC_CARAVAN_MOCK = {
    "status": "success",
    "provider": "azure",
    "suggested_workday_code": "WD-20260508-REAL",
    "context": {
        "cuit": "30-12345678-9",
        "renspa": "01.02.0.00001/01",
        "lote": "LOTE-REAL-001",
        "provider_id": 1,
        "farm_id": 1,
        "batch_id": null
    },
    "data": [
        {
            "table_id": 0,
            "row_count": 6,
            "column_count": 7,
            "headers": ["caravana", "sexo", "raza", "categoria", "dientes", "peso", "fecha"],
            "field_mapping": {
                "caravana": "identification",
                "sexo": "sex",
                "raza": "breed",
                "categoria": "category",
                "dientes": "teeth",
                "peso": "entry_weight",
                "fecha": "entry_date"
            },
            "rows": [
                {
                    "caravana": { "value": "1001", "confidence": 0.99 },
                    "sexo": { "value": "M", "confidence": 0.98 },
                    "raza": { "value": "Angus", "confidence": 0.99 },
                    "categoria": { "value": "Novillo", "confidence": 0.95 },
                    "dientes": { "value": "2", "confidence": 0.99 },
                    "peso": { "value": "340.5", "confidence": 0.99 },
                    "fecha": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "caravana": { "value": "1002", "confidence": 0.99 },
                    "sexo": { "value": "H", "confidence": 0.98 },
                    "raza": { "value": "Hereford", "confidence": 0.99 },
                    "categoria": { "value": "Vaquillonas", "confidence": 0.95 },
                    "dientes": { "value": "4", "confidence": 0.99 },
                    "peso": { "value": "280.0", "confidence": 0.99 },
                    "fecha": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "caravana": { "value": "1003", "confidence": 0.99 },
                    "sexo": { "value": "Macho", "confidence": 0.98 },
                    "raza": { "value": "Brangus", "confidence": 0.99 },
                    "categoria": { "value": "Ternero", "confidence": 0.95 },
                    "dientes": { "value": "0", "confidence": 0.99 },
                    "peso": { "value": "180.2", "confidence": 0.99 },
                    "fecha": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "caravana": { "value": "1004", "confidence": 0.99 },
                    "sexo": { "value": "Hembra", "confidence": 0.98 },
                    "raza": { "value": "Braford", "confidence": 0.99 },
                    "categoria": { "value": "Vaca", "confidence": 0.95 },
                    "dientes": { "value": "6", "confidence": 0.99 },
                    "peso": { "value": "420.0", "confidence": 0.99 },
                    "fecha": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "caravana": { "value": "1005", "confidence": 0.99 },
                    "sexo": { "value": "M", "confidence": 0.98 },
                    "raza": { "value": "Limousin", "confidence": 0.99 },
                    "categoria": { "value": "Toro", "confidence": 0.95 },
                    "dientes": { "value": "8", "confidence": 0.99 },
                    "peso": { "value": "650.0", "confidence": 0.99 },
                    "fecha": { "value": "08/05/2026", "confidence": 0.90 }
                }
            ],
            "mapped_rows": [
                {
                    "identification": { "value": "1001", "confidence": 0.99 },
                    "sex": { "value": "M", "confidence": 0.98 },
                    "breed": { "value": "Angus", "confidence": 0.99 },
                    "category": { "value": "novillo", "confidence": 0.95 },
                    "teeth": { "value": "2", "confidence": 0.99 },
                    "entry_weight": { "value": "340.5", "confidence": 0.99 },
                    "entry_date": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "identification": { "value": "1002", "confidence": 0.99 },
                    "sex": { "value": "H", "confidence": 0.98 },
                    "breed": { "value": "Hereford", "confidence": 0.99 },
                    "category": { "value": "vaquillonas", "confidence": 0.95 },
                    "teeth": { "value": "4", "confidence": 0.99 },
                    "entry_weight": { "value": "280.0", "confidence": 0.99 },
                    "entry_date": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "identification": { "value": "1003", "confidence": 0.99 },
                    "sex": { "value": "Macho", "confidence": 0.98 },
                    "breed": { "value": "Brangus", "confidence": 0.99 },
                    "category": { "value": "ternero", "confidence": 0.95 },
                    "teeth": { "value": "0", "confidence": 0.99 },
                    "entry_weight": { "value": "180.2", "confidence": 0.99 },
                    "entry_date": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "identification": { "value": "1004", "confidence": 0.99 },
                    "sex": { "value": "Hembra", "confidence": 0.98 },
                    "breed": { "value": "Braford", "confidence": 0.99 },
                    "category": { "value": "vaca", "confidence": 0.95 },
                    "teeth": { "value": "6", "confidence": 0.99 },
                    "entry_weight": { "value": "420.0", "confidence": 0.99 },
                    "entry_date": { "value": "08/05/2026", "confidence": 0.90 }
                },
                {
                    "identification": { "value": "1005", "confidence": 0.99 },
                    "sex": { "value": "M", "confidence": 0.98 },
                    "breed": { "value": "Limousin", "confidence": 0.99 },
                    "category": { "value": "toro", "confidence": 0.95 },
                    "teeth": { "value": "8", "confidence": 0.99 },
                    "entry_weight": { "value": "650.0", "confidence": 0.99 },
                    "entry_date": { "value": "08/05/2026", "confidence": 0.90 }
                }
            ]
        }
    ]
};

export const UPDATE_CARAVANS_MOCK = {
    "status": "success",
    "provider": "azure",
    "suggested_workday_code": "WD-20260508-EXIT",
    "context": {
        "cuit": "30-12345678-9",
        "renspa": "01.02.0.00001/01",
        "lote": "LOTE-REAL-001",
        "provider_id": 1,
        "farm_id": 1,
        "batch_id": null
    },
    "data": [
        {
            "table_id": 0,
            "row_count": 5,
            "column_count": 4,
            "headers": ["caravana", "peso_entrada", "peso_salida", "dientes"],
            "field_mapping": {
                "caravana": "identification",
                "peso_entrada": "entry_weight",
                "peso_salida": "exit_weight",
                "dientes": "teeth"
            },
            "rows": [
                {
                    "caravana": { "value": "1001", "confidence": 1 },
                    "peso_entrada": { "value": "340.5", "confidence": 1 },
                    "peso_salida": { "value": "360.0", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 }
                },
                {
                    "caravana": { "value": "1002", "confidence": 1 },
                    "peso_entrada": { "value": "280.0", "confidence": 1 },
                    "peso_salida": { "value": "305.5", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 }
                },
                {
                    "caravana": { "value": "1003", "confidence": 1 },
                    "peso_entrada": { "value": "180.2", "confidence": 1 },
                    "peso_salida": { "value": "210.0", "confidence": 1 },
                    "dientes": { "value": "2", "confidence": 1 }
                }
            ],
            "mapped_rows": [
                {
                    "identification": { "value": "1001", "confidence": 1 },
                    "entry_weight": { "value": "340.5", "confidence": 1 },
                    "exit_weight": { "value": "360.0", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 }
                },
                {
                    "identification": { "value": "1002", "confidence": 1 },
                    "entry_weight": { "value": "280.0", "confidence": 1 },
                    "exit_weight": { "value": "305.5", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 }
                },
                {
                    "identification": { "value": "1003", "confidence": 1 },
                    "entry_weight": { "value": "180.2", "confidence": 1 },
                    "exit_weight": { "value": "210.0", "confidence": 1 },
                    "teeth": { "value": "2", "confidence": 1 }
                }
            ]
        }
    ]
};
