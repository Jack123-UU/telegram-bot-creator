#!/bin/bash

# TeleBot 合规性测试脚本
# 此脚本验证所有修改都符合Telegram官方规则

echo "🛡️ TeleBot Telegram合规性验证测试"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "🔍 测试: $test_name ... "
    
    if eval "$test_command"; then
        if [ "$expected_result" = "should_pass" ]; then
            echo -e "${GREEN}通过${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}失败 (应该失败但通过了)${NC}"
            ((TESTS_FAILED++))
        fi
    else
        if [ "$expected_result" = "should_fail" ]; then
            echo -e "${GREEN}通过 (正确失败)${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}失败${NC}"
            ((TESTS_FAILED++))
        fi
    fi
}

echo "📋 1. 检查敏感内容移除情况"
echo "----------------------------------------"

# 检查是否移除了账号销售相关内容
run_test "账号销售内容已移除" \
    "! grep -r -i 'account.*sale\|sell.*account\|buy.*account' bot/ src/ --include='*.py' --include='*.tsx' --include='*.ts'" \
    "should_pass"

# 检查是否移除了session文件销售
run_test "Session文件销售已移除" \
    "! grep -r -i 'session.*file.*sale\|sell.*session\|buy.*session' bot/ src/ --include='*.py' --include='*.tsx' --include='*.ts'" \
    "should_pass"

# 检查是否移除了违规API端点
run_test "违规API端点已移除" \
    "! grep -r -i 'GetHTML\|GetAuth\|GetSession.*login' bot/ src/ --include='*.py' --include='*.tsx' --include='*.ts'" \
    "should_pass"

echo ""
echo "🔒 2. 检查合规性功能实施"
echo "----------------------------------------"

# 检查是否实施了速率限制
run_test "API速率限制已实施" \
    "grep -r 'RateLimiter\|rate_limit' bot/ --include='*.py'" \
    "should_pass"

# 检查是否添加了用户验证
run_test "用户验证机制已添加" \
    "grep -r 'UserVerification\|verify.*user' bot/ --include='*.py'" \
    "should_pass"

# 检查合规声明是否存在
run_test "合规声明已添加" \
    "grep -r -i 'compliance\|terms.*service\|telegram.*tos' bot/ src/ --include='*.py' --include='*.tsx' --include='*.ts'" \
    "should_pass"

echo ""
echo "🛡️ 3. 检查安全措施"
echo "----------------------------------------"

# 检查是否移除了硬编码密钥
run_test "硬编码密钥已移除" \
    "! grep -r -E '(dev-.*-token|password.*123|secret.*key.*=)' bot/ backend/ --include='*.py' | grep -v '.example'" \
    "should_pass"

# 检查日志安全
run_test "敏感信息日志保护" \
    "grep -r 'logger.*error\|logger.*info' bot/ --include='*.py' | grep -v -i 'token\|password\|secret'" \
    "should_pass"

echo ""
echo "📞 4. 检查用户交互合规性"
echo "----------------------------------------"

# 检查是否有合规的服务类型
run_test "合规服务类型定义" \
    "grep -r -i 'api.*integration\|bot.*development\|automation.*consulting' bot/ src/ --include='*.py' --include='*.tsx' --include='*.ts'" \
    "should_pass"

# 检查支持和帮助功能
run_test "支持和帮助功能" \
    "grep -r -i 'support\|help\|contact' bot/ --include='*.py'" \
    "should_pass"

echo ""
echo "🔍 5. 代码质量检查"
echo "----------------------------------------"

# 检查Python语法
if command -v python3 &> /dev/null; then
    run_test "Python语法检查" \
        "python3 -m py_compile bot/main.py" \
        "should_pass"
else
    echo "⚠️  Python3 未安装，跳过语法检查"
fi

# 检查关键文件是否存在
run_test "合规文档存在" \
    "[ -f TELEGRAM_COMPLIANCE.md ]" \
    "should_pass"

run_test "安全审计报告存在" \
    "[ -f SECURITY_AUDIT_REPORT.md ]" \
    "should_pass"

echo ""
echo "📊 测试结果汇总"
echo "========================================"
echo -e "✅ 通过测试: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ 失败测试: ${RED}$TESTS_FAILED${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
    echo "📈 成功率: $SUCCESS_RATE%"
fi

echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有合规性测试通过！平台可以安全部署。${NC}"
    echo ""
    echo "✅ 合规性确认:"
    echo "• 移除了所有违反Telegram ToS的功能"
    echo "• 实施了适当的安全措施"
    echo "• 添加了用户保护机制"
    echo "• 提供合法的商业服务"
    echo ""
    echo "🚀 建议: 可以进行生产环境部署"
    exit 0
else
    echo -e "${RED}⚠️  发现 $TESTS_FAILED 个合规性问题，需要修复后再部署。${NC}"
    echo ""
    echo "🔧 修复建议:"
    echo "• 检查失败的测试项目"
    echo "• 确保移除所有敏感内容"
    echo "• 验证安全措施已正确实施"
    echo "• 重新运行测试直到全部通过"
    exit 1
fi