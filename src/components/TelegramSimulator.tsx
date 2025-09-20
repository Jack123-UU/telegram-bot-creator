import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  ArrowCounterClockwise, 
  DeviceMobile,
  Robot,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  User,
  ChatCircle,
  ArrowRight
} from '@phosphor-icons/react'

interface Message {
  id: number
  type: 'user' | 'bot'
  text: string
  timestamp: string
  isTyping?: boolean
  hasButtons?: boolean
  buttons?: string[]
  hasImage?: boolean
  imageUrl?: string
}

const demoScript = [
  {
    delay: 1000,
    message: {
      id: 1,
      type: 'bot' as const,
      text: '👋 欢迎来到智能销售机器人！我是您的专属购物助手。',
      timestamp: '14:32',
      hasButtons: true,
      buttons: ['🛍️ 浏览商品', '📋 查看订单', '💬 联系客服']
    }
  },
  {
    delay: 2000,
    message: {
      id: 2,
      type: 'user' as const,
      text: '🛍️ 浏览商品',
      timestamp: '14:32'
    }
  },
  {
    delay: 1500,
    message: {
      id: 3,
      type: 'bot' as const,
      text: '🎯 为您推荐热门商品分类：',
      timestamp: '14:32',
      hasButtons: true,
      buttons: ['📱 数码产品', '👕 服装配饰', '🏠 家居用品', '📚 图书文具']
    }
  },
  {
    delay: 2000,
    message: {
      id: 4,
      type: 'user' as const,
      text: '📱 数码产品',
      timestamp: '14:33'
    }
  },
  {
    delay: 2000,
    message: {
      id: 5,
      type: 'bot' as const,
      text: '📱 精选数码产品：\n\n🎧 蓝牙耳机 Pro - ¥299\n📱 智能手机壳 - ¥89\n⌚ 智能手表 - ¥1299\n💻 无线鼠标 - ¥159',
      timestamp: '14:33',
      hasImage: true,
      imageUrl: '/api/placeholder/300/200',
      hasButtons: true,
      buttons: ['🎧 蓝牙耳机详情', '📱 手机壳详情', '⌚ 手表详情']
    }
  },
  {
    delay: 2500,
    message: {
      id: 6,
      type: 'user' as const,
      text: '🎧 蓝牙耳机详情',
      timestamp: '14:33'
    }
  },
  {
    delay: 2000,
    message: {
      id: 7,
      type: 'bot' as const,
      text: '🎧 蓝牙耳机 Pro\n\n💰 价格：¥299\n⭐ 评分：4.8/5\n📦 库存：充足\n🚚 配送：24小时内发货\n\n✨ 特色功能：\n• 主动降噪技术\n• 30小时续航\n• 快速充电\n• IPX4防水',
      timestamp: '14:33',
      hasImage: true,
      imageUrl: '/api/placeholder/250/200',
      hasButtons: true,
      buttons: ['🛒 立即购买', '❤️ 加入收藏', '📊 查看评价']
    }
  },
  {
    delay: 2000,
    message: {
      id: 8,
      type: 'user' as const,
      text: '🛒 立即购买',
      timestamp: '14:34'
    }
  },
  {
    delay: 1500,
    message: {
      id: 9,
      type: 'bot' as const,
      text: '🛒 商品已加入购物车！\n\n📋 订单详情：\n• 蓝牙耳机 Pro × 1\n• 价格：¥299\n• 运费：免费\n\n💳 选择支付方式：',
      timestamp: '14:34',
      hasButtons: true,
      buttons: ['💳 微信支付', '💰 支付宝', '🏦 银行卡']
    }
  },
  {
    delay: 2000,
    message: {
      id: 10,
      type: 'user' as const,
      text: '💳 微信支付',
      timestamp: '14:34'
    }
  },
  {
    delay: 2000,
    message: {
      id: 11,
      type: 'bot' as const,
      text: '💳 正在处理支付...\n\n📄 请确认订单信息：\n• 商品：蓝牙耳机 Pro\n• 数量：1\n• 金额：¥299\n• 收货地址：北京市朝阳区...\n\n✅ 支付成功！',
      timestamp: '14:34'
    }
  },
  {
    delay: 1500,
    message: {
      id: 12,
      type: 'bot' as const,
      text: '🎉 订单创建成功！\n\n📦 订单号：TB202412001\n🚚 预计送达：明天下午\n📱 您可以随时查询物流状态\n\n感谢您的购买！还有其他需要帮助的吗？',
      timestamp: '14:35',
      hasButtons: true,
      buttons: ['📦 查看订单', '🛍️ 继续购物', '⭐ 评价服务']
    }
  }
]

export function TelegramSimulator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [typingBot, setTypingBot] = useState(false)

  const resetDemo = () => {
    setMessages([])
    setCurrentStep(0)
    setProgress(0)
    setIsPlaying(false)
    setTypingBot(false)
  }

  const startDemo = () => {
    if (currentStep >= demoScript.length) {
      resetDemo()
      return
    }
    setIsPlaying(true)
  }

  const pauseDemo = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!isPlaying || currentStep >= demoScript.length) return

    const step = demoScript[currentStep]
    const timer = setTimeout(() => {
      if (step.message.type === 'bot') {
        setTypingBot(true)
        setTimeout(() => {
          setMessages(prev => [...prev, step.message])
          setTypingBot(false)
          setCurrentStep(prev => prev + 1)
          setProgress(((currentStep + 1) / demoScript.length) * 100)
        }, 1000)
      } else {
        setMessages(prev => [...prev, step.message])
        setCurrentStep(prev => prev + 1)
        setProgress(((currentStep + 1) / demoScript.length) * 100)
      }
    }, step.delay)

    return () => clearTimeout(timer)
  }, [currentStep, isPlaying])

  useEffect(() => {
    if (currentStep >= demoScript.length) {
      setIsPlaying(false)
    }
  }, [currentStep])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <DeviceMobile size={24} className="text-primary" />
            Telegram 机器人演示
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={isPlaying ? pauseDemo : startDemo}
                size="sm"
                className="gap-2"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? '暂停' : currentStep >= demoScript.length ? '重新开始' : '开始演示'}
              </Button>
              <Button
                onClick={resetDemo}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <ArrowCounterClockwise size={16} />
                重置
              </Button>
            </div>
            <div className="flex-1 max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">
                进度: {currentStep}/{demoScript.length}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            {/* Telegram Header */}
            <div className="bg-blue-500 text-white p-3 rounded-t-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Robot size={20} />
              </div>
              <div>
                <h3 className="font-medium">智能销售机器人</h3>
                <p className="text-xs opacity-80">在线</p>
              </div>
            </div>

            {/* Messages Container */}
            <div className="bg-gray-50 min-h-[500px] max-h-[500px] overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
                      : 'bg-white border rounded-r-lg rounded-tl-lg shadow-sm'
                  } p-3`}>
                    {message.hasImage && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-muted-foreground">
                          <ShoppingCart size={32} />
                        </div>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    {message.hasButtons && (
                      <div className="mt-3 space-y-1">
                        {message.buttons?.map((button, index) => (
                          <div
                            key={index}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm py-2 px-3 rounded cursor-pointer transition-colors border"
                          >
                            {button}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {typingBot && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-r-lg rounded-tl-lg shadow-sm p-3">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">正在输入...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-3 rounded-b-lg flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                <span className="text-gray-500 text-sm">输入消息...</span>
              </div>
              <Button size="sm" className="rounded-full w-10 h-10 p-0">
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ChatCircle size={24} className="text-blue-500" />
              <div>
                <h3 className="font-medium">智能对话</h3>
                <p className="text-sm text-muted-foreground">自然语言交互</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} className="text-green-500" />
              <div>
                <h3 className="font-medium">商品展示</h3>
                <p className="text-sm text-muted-foreground">图文并茂展示</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-purple-500" />
              <div>
                <h3 className="font-medium">在线支付</h3>
                <p className="text-sm text-muted-foreground">多种支付方式</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>演示统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{messages.filter(m => m.type === 'bot').length}</div>
              <div className="text-sm text-muted-foreground">机器人消息</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{messages.filter(m => m.type === 'user').length}</div>
              <div className="text-sm text-muted-foreground">用户交互</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{messages.filter(m => m.hasButtons).length}</div>
              <div className="text-sm text-muted-foreground">交互按钮</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">完成进度</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}