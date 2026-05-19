import AgentCard from './AgentCard'

export default function AgentPipeline({ agents }) {
  return (
    <div className="flex items-stretch gap-2">
      {agents.map((agent, i) => (
        <div key={agent.id} className="flex items-center gap-2 flex-1 min-w-0">
          {/* Agent card */}
          <div className="flex-1 min-w-0">
            <AgentCard agent={agent} />
          </div>

          {/* Connector arrow — skip after last */}
          {i < agents.length - 1 && (
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              {/* Arrow line */}
              <div
                className={`h-0.5 w-6 rounded-full transition-all duration-700 ${
                  agent.status === 'complete' ? 'connector-active' : 'connector-idle'
                }`}
              />
              {/* Arrowhead */}
              <div
                className={`w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] transition-colors duration-700 ${
                  agent.status === 'complete' ? 'border-l-emerald-500' : 'border-l-[#1c1c3a]'
                }`}
                style={{ marginTop: '-4px' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
