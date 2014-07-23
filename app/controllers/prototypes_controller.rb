class PrototypesController < ApplicationController
  def heatmap
    @all_passes_for_prototype = Pass.where("prototype_id = '1'")
    render json: @all_passes_for_prototype.as_json(only: [:task_id, :participant_id, :sum])
  end
end