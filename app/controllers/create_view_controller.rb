class CreateViewController < ApplicationController
  def overview
    @project = Project.find(params[:project_id])
    pids = []
    @project.prototypes.first ? pids[0] = @project.prototypes.first.id : pids[0] = 0
    @project.prototypes.second ? pids[1] = @project.prototypes.first.id : pids[1] = 0
    @prototype_ids = pids.to_json
    render 'overview'
  end
end