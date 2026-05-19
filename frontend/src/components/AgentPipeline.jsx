import AgentCard from './AgentCard'

export default function AgentPipeline({ agents }) {
  return (
    <div className="flex items-stretch gap-2">
      {agents.map((agent, i) => (
        <div key={agent.id} className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <AgentCard agent={agent} index={i} />
          </div>

          {i < agents.length - 1 && (
            <div className="flex items-center flex-shrink-0 gap-0">
              <div className={`h-px w-5 transition-all duration-700 ${
                agent.status === 'complete' ? 'conn-done' : 'conn-idle bg-edge'
              }`} />
              <div className={`w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] transition-colors duration-700 ${
                agent.status === 'complete' ? 'border-l-grove/60' : 'border-l-edge'
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
