import { InfiniteScrollDemo } from '@/spaces/components/chat/infinite-scroll-demo'

export default function TestScrollPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Infinite Scroll Chat Demo</h1>
          <p className="text-gray-300">
            This demonstrates the infinite scroll component for chat messages. 
            Scroll to the top to load older messages. The component uses the 
            IntersectionObserver API for optimal performance.
          </p>
        </div>
        
        <InfiniteScrollDemo />
        
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Key Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Reverse Loading:</strong> New messages appear at bottom, older at top</li>
            <li>• <strong>Intersection Observer:</strong> Efficient scroll detection</li>
            <li>• <strong>Smooth UX:</strong> Loading indicators and state management</li>
            <li>• <strong>Dense Layout:</strong> Minimal spacing for better message density</li>
            <li>• <strong>Auto-scroll:</strong> Automatically scrolls to bottom for new messages</li>
            <li>• <strong>Performance:</strong> Only renders visible elements efficiently</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 