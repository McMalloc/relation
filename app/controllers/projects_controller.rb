class ProjectsController < ApplicationController
  def index
    @projects = Project.all
  end
  
  def new
    @project = Project.new
  end
  
  def create
    @project = Project.new(project_params)
    puts @project.to_yaml
    respond_to do |format|
      if @project.save
        @prototype1 = Prototype.new(project_id: @project.id, moniker: "")
        @prototype2 = Prototype.new(project_id: @project.id, moniker: "")
        @prototype1.save
        @prototype2.save
        format.html { redirect_to action: "index" }
      else
        format.html { render action: "new" }
      end
    end
  end
  
  def project_params
    params.require(:project).permit!
  end
  
  def show
    @project = Project.find(params[:id])
    redirect_to controller: "create_view", action: "overview", project_id: @project.id
  end
  
end