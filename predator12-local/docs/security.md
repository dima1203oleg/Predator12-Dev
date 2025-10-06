# Безпека та PII

## Система захисту PII

Predator11 має вбудовану систему захисту персональних та чутливих даних (PII - Personally Identifiable Information).

## Автоматичне маскування

### Типи даних що маскуються:
- **EDRPOU коди** - ідентифікатори підприємств
- **Назви компаній** - повні назви організацій  
- **Персональні дані** - імена, адреси, телефони
- **Фінансові дані** - банківські реквізити, суми

### Алгоритм маскування:
```python
# Приклад маскування
company_name: "ТОВ Приклад" -> company_mask: "a1b2c3d4"
edrpou: "12345678" -> edrpou_mask: "e1f2g3h4"
```

## Рівні доступу

### Safe індекси (*_safe_*)
- Замасковані дані
- Доступ за замовчуванням
- Безпечні для аналітики

### Restricted індекси (*_restricted_*)
- Повні незамасковані дані
- Потребує роль `view_pii`
- Повний аудит доступу

## Аудит

Всі доступи до PII логуються:

```sql
SELECT user_id, accessed_at, data_type, purpose 
FROM audit_pii_access 
WHERE accessed_at > NOW() - INTERVAL '24 hours';
```

## Конфігурація

Налаштування PII в `.env`:
```bash
PII_SALT=random-salt-for-pii-hashing
PII_DETECTION_ENABLED=true
```
