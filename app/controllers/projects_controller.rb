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
        @prototype = Prototype.new(project_id: @project.id)
        @prototype.save
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