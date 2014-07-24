class PrototypesController < ApplicationController
  def fetch
    @all_passes_for_prototype = Pass.where("prototype_id = " + params[:prototype_id])
    render json: @all_passes_for_prototype.as_json()
  end
  def heatmap
    render 'heatmap'
  end
end