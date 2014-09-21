class CreateViewController < ApplicationController
  def overview
    @project = Project.find(params[:project_id])
    render 'overview'
  end
  
  def new_task

  end
end