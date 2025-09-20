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
      text: '🤖 Welcome to TeleBot Business Automation Platform!\n\n🔧 Professional Bot Services & API Solutions',
      timestamp: '14:32',
      hasButtons: true,
      buttons: ['🔧 API Services', '🛠️ Development Tools', '📞 Support']
    }
  },
  {
    delay: 2000,
    message: {
      id: 2,
      type: 'user' as const,
      text: '🔧 API Services',
      timestamp: '14:32'
    }
  },
  {
    delay: 1500,
    message: {
      id: 3,
      type: 'bot' as const,
      text: '🔧 Professional API & Bot Services\n\nWe provide legitimate business automation solutions:\n\n🔌 API Integration Services\n🤖 Bot Development Services\n⚙️ Automation Consulting',
      timestamp: '14:32',
      hasButtons: true,
      buttons: ['🔌 API Integration', '🤖 Bot Development', '⚙️ Automation']
    }
  },
  {
    delay: 2000,
    message: {
      id: 4,
      type: 'user' as const,
      text: '🔌 API Integration',
      timestamp: '14:33'
    }
  },
  {
    delay: 2000,
    message: {
      id: 5,
      type: 'bot' as const,
      text: '🔌 API Integration Services:\n\n🔹 Custom API Development - $99.99\n   • Tailored API solutions\n\n🔹 Third-party Integration - $149.99\n   • Connect your systems\n\n🔹 Webhook Implementation - $79.99\n   • Real-time data sync',
      timestamp: '14:33',
      hasImage: true,
      imageUrl: '/api/placeholder/300/200',
      hasButtons: true,
      buttons: ['📞 Consult: Custom API', '📞 Consult: Integration', '📞 Consult: Webhooks']
    }
  },
  {
    delay: 2500,
    message: {
      id: 6,
      type: 'user' as const,
      text: '📞 Consult: Custom API',
      timestamp: '14:33'
    }
  },
  {
    delay: 2000,
    message: {
      id: 7,
      type: 'bot' as const,
      text: '📞 Service Consultation Request\n\n🔧 Service Category: API Integration\n📋 Service ID: #1\n👤 Requested by: @user\n\n📋 Next Steps:\n1. Technical team review\n2. Detailed proposal within 24 hours\n3. Consultation call if needed\n\n💰 Consultation: FREE (30 minutes)',
      timestamp: '14:33',
      hasImage: true,
      imageUrl: '/api/placeholder/250/200',
      hasButtons: true,
      buttons: ['✅ Confirm Request', '❌ Cancel', '📞 Direct Contact']
    }
  },
  {
    delay: 2000,
    message: {
      id: 8,
      type: 'user' as const,
      text: '✅ Confirm Request',
      timestamp: '14:34'
    }
  },
  {
    delay: 1500,
    message: {
      id: 9,
      type: 'bot' as const,
      text: '✅ Consultation Request Submitted!\n\n📧 Confirmation: Your request has been received\n👨‍💼 Assigned to: Technical consulting team\n📅 Follow-up: Within 24 hours\n\n🎯 What to expect:\n• Requirement analysis\n• Custom solution proposal\n• Technical feasibility review',
      timestamp: '14:34',
      hasButtons: true,
      buttons: ['🏠 Main Menu', '📞 Support', '🛡️ Terms & Compliance']
    }
  },
  {
    delay: 2000,
    message: {
      id: 10,
      type: 'user' as const,
      text: '🛡️ Terms & Compliance',
      timestamp: '14:34'
    }
  },
  {
    delay: 2000,
    message: {
      id: 11,
      type: 'bot' as const,
      text: '⚖️ Terms of Service & Compliance\n\n🛡️ Our Compliance Standards:\n\n✅ Telegram ToS Compliance\n• No violation of Telegram terms\n• Respect for user privacy\n• No spam or abuse\n\n✅ Service Standards\n• Legitimate business services only\n• Professional API integrations\n• Ethical automation solutions',
      timestamp: '14:34'
    }
  },
  {
    delay: 1500,
    message: {
      id: 12,
      type: 'bot' as const,
      text: '🛡️ All our services are fully compliant with:\n• Telegram Terms of Service\n• Applicable laws and regulations\n• Industry best practices\n\nThank you for choosing our professional automation services!',
      timestamp: '14:35',
      hasButtons: true,
      buttons: ['🔧 Browse Services', '📞 Contact Support', '📚 Documentation']
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
            TeleBot Professional Services Demo
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
                <h3 className="font-medium">TeleBot Business Platform</h3>
                <p className="text-xs opacity-80">Professional Services • Online</p>
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
                <h3 className="font-medium">Professional APIs</h3>
                <p className="text-sm text-muted-foreground">Compliant integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} className="text-green-500" />
              <div>
                <h3 className="font-medium">Business Automation</h3>
                <p className="text-sm text-muted-foreground">Workflow solutions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-purple-500" />
              <div>
                <h3 className="font-medium">Consulting Services</h3>
                <p className="text-sm text-muted-foreground">Expert guidance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{messages.filter(m => m.type === 'bot').length}</div>
              <div className="text-sm text-muted-foreground">Bot Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{messages.filter(m => m.type === 'user').length}</div>
              <div className="text-sm text-muted-foreground">User Interactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{messages.filter(m => m.hasButtons).length}</div>
              <div className="text-sm text-muted-foreground">Interactive Buttons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}