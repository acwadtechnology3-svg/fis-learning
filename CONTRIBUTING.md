# Git Workflow

## Branches
- `main`: دائمًا مستقر، لا يتم الدمج إلا عبر Pull Request
- `feature/<name>`: كل ميزة جديدة
- `bugfix/<name>`: لإصلاح الأخطاء
- `release/<version>`: تحضير النسخ للإنتاج

## Rules
1. كل commit يجب أن يكون على feature branch.
2. الدمج إلى main عبر Pull Request فقط.
3. على الأقل مراجعة واحدة قبل الدمج.
4. اجتياز جميع الاختبارات قبل الدمج.

## Workflow
1. إنشاء فرع feature: `git checkout -b feature/login`
2. تطوير الميزات على الفرع
3. عمل commit و push: `git push origin feature/login`
4. فتح Pull Request للمراجعة والدمج
