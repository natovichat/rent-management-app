# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e6]:
      - generic [ref=e7]: מעבר לטבלה
      - generic [ref=e8]:
        - combobox "מעבר לטבלה דיירים" [ref=e9] [cursor=pointer]:
          - img [ref=e11]
          - generic [ref=e13]: דיירים
        - textbox: tenants
        - img
        - group:
          - generic: מעבר לטבלה
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - heading "ניהול דיירים" [level=1] [ref=e17]
          - paragraph [ref=e18]: רשימת כל הדיירים במערכת
        - button "דייר חדש" [ref=e19] [cursor=pointer]:
          - img [ref=e21]
          - text: דייר חדש
      - generic [ref=e25]:
        - img [ref=e27]
        - textbox "חפש לפי שם, אימייל או טלפון..." [ref=e29]
        - group
      - generic [ref=e30]:
        - heading "אין דיירים במערכת" [level=6] [ref=e31]
        - paragraph [ref=e32]: התחל על ידי הוספת דייר ראשון
        - button "הוסף דייר ראשון" [ref=e33] [cursor=pointer]:
          - img [ref=e35]
          - text: הוסף דייר ראשון
  - alert [ref=e37]
```