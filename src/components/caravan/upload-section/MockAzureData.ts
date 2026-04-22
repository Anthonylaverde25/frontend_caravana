/**
 * Mock data representing a successful Azure OCR response for testing purposes.
 */
export const MOCK_AZURE_RESPONSE = {
    "status": "success",
    "provider": "azure",
    "document_info": {
        "pages": 1,
        "model_id": "mock-azure-model-v1"
    },
    "context": {
        "cuit": "30-98765432-1",
        "renspa": "01.02.0.00002/01",
        "lote": "mock-lote-test",
        "provider_id": 2,
        "farm_id": 4,
        "batch_id": null
    },
    "data": [
        {
            "table_id": 0,
            "row_count": 8,
            "column_count": 5,
            "headers": [
                "caravana",
                "dientes",
                "categoria",
                "peso_entrada",
                "peso_salida"
            ],
            "field_mapping": {
                "caravana": "identification",
                "dientes": "teeth",
                "categoria": "category",
                "peso_entrada": "entry_weight",
                "peso_salida": "exit_weight"
            },
            "unresolved_headers": [],
            "rows": [
                {
                    "caravana": { "value": "02", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 },
                    "categoria": { "value": "Vaquilla", "confidence": 1 },
                    "peso_entrada": { "value": "", "confidence": 1 },
                    "peso_salida": { "value": "300", "confidence": 1 }
                },
                {
                    "caravana": { "value": "03", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 },
                    "categoria": { "value": "vaquilla", "confidence": 1 },
                    "peso_entrada": { "value": "", "confidence": 1 },
                    "peso_salida": { "value": "320", "confidence": 1 }
                },
                {
                    "caravana": { "value": "04", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 },
                    "categoria": { "value": "vaquilla", "confidence": 1 },
                    "peso_entrada": { "value": "", "confidence": 1 },
                    "peso_salida": { "value": "310", "confidence": 1 }
                },
                {
                    "caravana": { "value": "05", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 },
                    "categoria": { "value": "vaquilla", "confidence": 1 },
                    "peso_entrada": { "value": "", "confidence": 1 },
                    "peso_salida": { "value": "320", "confidence": 1 }
                },
                {
                    "caravana": { "value": "06", "confidence": 1 },
                    "dientes": { "value": "4", "confidence": 1 },
                    "categoria": { "value": "vaquilla", "confidence": 1 },
                    "peso_entrada": { "value": "", "confidence": 1 },
                    "peso_salida": { "value": "300", "confidence": 1 }
                }
            ],
            "mapped_rows": [
                {
                    "identification": { "value": "02", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 },
                    "category": { "value": "vaquilla", "confidence": 1 },
                    "entry_weight": { "value": "", "confidence": 1 },
                    "exit_weight": { "value": "300", "confidence": 1 }
                },
                {
                    "identification": { "value": "03", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 },
                    "category": { "value": "vaquilla", "confidence": 1 },
                    "entry_weight": { "value": "", "confidence": 1 },
                    "exit_weight": { "value": "320", "confidence": 1 }
                },
                {
                    "identification": { "value": "04", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 },
                    "category": { "value": "vaquilla", "confidence": 1 },
                    "entry_weight": { "value": "", "confidence": 1 },
                    "exit_weight": { "value": "310", "confidence": 1 }
                },
                {
                    "identification": { "value": "05", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 },
                    "category": { "value": "vaquilla", "confidence": 1 },
                    "entry_weight": { "value": "", "confidence": 1 },
                    "exit_weight": { "value": "320", "confidence": 1 }
                },
                {
                    "identification": { "value": "06", "confidence": 1 },
                    "teeth": { "value": "4", "confidence": 1 },
                    "category": { "value": "vaquilla", "confidence": 1 },
                    "entry_weight": { "value": "", "confidence": 1 },
                    "exit_weight": { "value": "300", "confidence": 1 }
                }
            ]
        }
    ]
};
