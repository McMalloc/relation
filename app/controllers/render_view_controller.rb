class RenderViewController < ApplicationController
  def heatmap
    @project = Project.find(params[:project_id])
    puts @project.to_yaml
    render 'heatmap'
  end
end
