class CreateViewController < ApplicationController
  def overview
    @project = Project.find(params[:project_id])
    @prototypeID = @project.prototypes.first.id
    render 'overview'
  end
end