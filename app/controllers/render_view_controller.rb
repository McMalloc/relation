class RenderViewController < ApplicationController
  def heatmap
    @project = Project.find(params[:project_id])
    pids = []
    @project.prototypes.first ? pids[0] = @project.prototypes.first.id : pids[0] = 0
    @project.prototypes.second ? pids[1] = @project.prototypes.second.id : pids[1] = 0
    @prototype_ids = pids.to_json
    puts @prototype_ids.to_yaml
    render 'heatmap'
  end
end
