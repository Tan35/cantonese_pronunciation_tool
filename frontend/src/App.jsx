import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Copy, Trash2, Sparkles, Moon, Sun, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeFormat, setActiveFormat] = useState('jyutping')
  const [examples, setExamples] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    setIsDarkMode(shouldUseDark)
    updateTheme(shouldUseDark)
  }, [])

  // 更新主题
  const updateTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    updateTheme(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  // 获取示例文本
  useEffect(() => {
    fetch('/api/pronunciation/examples')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setExamples(data.examples)
        }
      })
      .catch(err => console.error('获取示例失败:', err))
  }, [])

  // 实时转换
  useEffect(() => {
    if (inputText.trim()) {
      const timer = setTimeout(() => {
        convertText()
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setResult(null)
    }
  }, [inputText, activeFormat])

  const convertText = async () => {
    if (!inputText.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/pronunciation/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          format: activeFormat
        })
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.result)
      } else {
        console.error('转换失败:', data.error)
      }
    } catch (error) {
      console.error('请求失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text.length > 20 ? text.substring(0, 20) + '...' : text)
      setCopySuccess(true)
      
      // 3秒后自动隐藏提示
      setTimeout(() => {
        setCopySuccess(false)
      }, 3000)
    } catch (error) {
      console.error('复制失败:', error)
      // 可以在这里添加复制失败的提示
    }
  }

  const clearInput = () => {
    setInputText('')
    setResult(null)
  }

  const useExample = (text) => {
    setInputText(text)
  }

  const formatOptions = [
    { value: 'jyutping', label: '粤拼标注', description: '咁(gam3)啱(ngaam1)' },
    { value: 'jyutping_text', label: '纯拼音', description: 'gam3 ngaam1' },
    { value: 'ipa', label: 'IPA标注', description: '咁[kɐm˧]啱[ŋaːm˥]' },
    { value: 'jyutping_candidates', label: '候选读音', description: '多音字选项' }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 to-gray-100'
    }`}>
      {/* 复制成功提示 */}
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border-2 backdrop-blur-sm ${
              isDarkMode
                ? 'bg-green-900/90 border-green-600 text-green-100'
                : 'bg-green-50/90 border-green-200 text-green-800'
            }`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-green-600' : 'bg-green-500'
                }`}
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
              <div>
                <div className="font-medium">复制成功！</div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-green-200' : 'text-green-600'
                }`}>
                  已复制：{copiedText}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主题切换按钮 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-6 right-6 z-50"
      >
        <Button
          onClick={toggleTheme}
          size="sm"
          variant="outline"
          className={`w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-yellow-400'
              : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDarkMode ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* 头部区域 */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-3 mb-6"
        >
          <Sparkles className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h1 className={`text-5xl font-light tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            粤语拼音标注
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-xl font-light ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Cantonese Pronunciation Automatic Labeling Tool
        </motion.p>
      </motion.header>

      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* 输入区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className={`shadow-lg border-0 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/80 backdrop-blur-sm' 
              : 'bg-white/80 backdrop-blur-sm'
          }`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-lg font-medium ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>
                输入文本
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                支持字、词、句子输入，实时显示粤语拼音
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="请输入要转换的中文文本..."
                  className={`min-h-[120px] text-lg resize-none transition-colors duration-300 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-blue-400/20'
                  }`}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${
                    isDarkMode ? 'bg-gray-600 text-gray-200' : ''
                  }`}>
                    {inputText.length} 字符
                  </Badge>
                  {inputText && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearInput}
                      className={`h-6 w-6 p-0 transition-colors duration-300 ${
                        isDarkMode
                          ? 'hover:bg-red-900/50 hover:text-red-400'
                          : 'hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* 格式选择 */}
              <Tabs value={activeFormat} onValueChange={setActiveFormat}>
                <TabsList className={`grid w-full grid-cols-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {formatOptions.map((option) => (
                    <TabsTrigger
                      key={option.value}
                      value={option.value}
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode
                          ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white'
                          : 'data-[state=active]:bg-white data-[state=active]:shadow-sm'
                      }`}
                    >
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* 结果显示区域 */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className={`shadow-lg border-0 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/80 backdrop-blur-sm' 
                  : 'bg-white/80 backdrop-blur-sm'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg font-medium ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      转换结果
                    </CardTitle>
                    {loading && (
                      <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                        isDarkMode ? 'border-blue-400' : 'border-blue-600'
                      }`} />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeFormat}>
                    {formatOptions.map((option) => (
                      <TabsContent key={option.value} value={option.value}>
                        <div className="space-y-4">
                          <div className={`rounded-lg p-4 border transition-colors duration-300 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-gray-50 border'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-700'
                              }`}>
                                {option.label}
                              </span>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(result[option.value] || '')}
                                  className={`h-8 px-3 text-xs transition-all duration-300 ${
                                    isDarkMode
                                      ? 'hover:bg-blue-900/50 hover:text-blue-300 text-gray-300'
                                      : 'hover:bg-blue-50 hover:text-blue-600'
                                  }`}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  复制
                                </Button>
                              </motion.div>
                            </div>
                            <div className={`text-lg font-mono leading-relaxed break-all ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {option.value === 'jyutping_candidates' ? (
                                <div className="space-y-2">
                                  {result[option.value]?.map(([char, candidates], index) => (
                                    <div key={index} className="flex items-center gap-2 flex-wrap">
                                      <span className={`font-bold ${
                                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                      }`}>{char}:</span>
                                      {candidates.map((candidate, i) => (
                                        <Badge key={i} variant="outline" className={`text-xs ${
                                          isDarkMode 
                                            ? 'border-gray-500 text-gray-200' 
                                            : ''
                                        }`}>
                                          {candidate}
                                        </Badge>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                result[option.value]
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 示例区域 */}
        {examples.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className={`shadow-lg border-0 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/80 backdrop-blur-sm' 
                : 'bg-white/80 backdrop-blur-sm'
            }`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-lg font-medium ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  示例文本
                </CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  点击下方示例快速体验
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {examples.map((example, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => useExample(example.text)}
                        className={`w-full h-auto p-4 text-left justify-start transition-colors duration-300 ${
                          isDarkMode
                            ? 'border-gray-600 hover:bg-blue-900/30 hover:border-blue-500 text-gray-200'
                            : 'hover:bg-blue-50 hover:border-blue-200'
                        }`}
                      >
                        <div>
                          <div className={`font-medium mb-1 ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {example.text}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {example.description}
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* 底部信息 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className={`text-center py-8 px-4 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}
      >
        <p>基于 ToJyutping 库构建 · 准确率达 99%</p>
      </motion.footer>
    </div>
  )
}

export default App

