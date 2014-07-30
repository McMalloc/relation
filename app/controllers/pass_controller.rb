class PassController < ApplicationController
  def fetch
    
    #http://localhost:3000/vis/fetch/pass?project_id=1?prototype_id=1?task_id=all?participant_id=2
    
    @project_q      = ""#"project_id = " + params[:project_id] #TODO: make selectable through JOIN with prototype relation
    @prototype_q    = params[:prototype_id]   == "all" ? "" 
                    : "prototype_id = " + params[:prototype_id]
    @task_q         = params[:task_id]        == "all" ? "" 
                    : "task_id = " + params[:task_id]
    @participant_q  = params[:participant_id] == "all" ? "" 
                    : "participant_id = " + params[:participant_id]
    
    puts "Query for Project: " + params[:project_id]
    puts "Query for Prototype: " + params[:prototype_id]
    puts "Query for Task: " + params[:task_id]
    puts "Query for Participant: " + params[:participant_id]
    puts "Pass.where " + @project_q + @prototype_q + @task_q + @participant_q
    
    @passes_by_query = Pass.where(@project_q).where(@prototype_q).where(@task_q).where(@participant_q)
    render json: @passes_by_query.as_json(
                    only: [ :id, 
                            :task_id, 
                            :participant_id, 
                            :tasktime, 
                            :satisfaction, 
                            :prototype_id
                          ]
                  )
  end
  
  def index
    @passes = Pass.all
  end
end