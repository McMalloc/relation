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
    
    puts params
    
    @passes_by_query = Pass.where(@project_q).where(@prototype_q).where(@task_q).where(@participant_q)
    render json: @passes_by_query, root: false
    # find JSON definition in the serializer
  end
  @@data = File.read("public/passes.json")
  def index
    @passes = Pass.all
    render json: @passes, root: false
  end
  
  def update
    @pass = Pass.find(params[:id])
    @pass.update_attributes(pass_params)
    render json: @pass, root: false, status: :ok
  end  
  
  def show
    puts "Pass-show"
    puts params.to_yaml
    @pass = Pass.find(params[:pass_id])
    render json: @pass, root: false
  end
  
  def create
    @pass = Pass.create(pass_params)
    puts "Creating"
    puts @pass.to_yaml
    render json: @pass, root: false
  end
  
  def pass_params
    params.require(:pass).permit!
  end
end